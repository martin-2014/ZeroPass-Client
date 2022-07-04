import { RecordEntity, VaultItemEntity, VaultItemType } from "../entities";
import { IBaseRepository, ILocalDb, IMerge } from "../interfaces";
import { PasswordHistoryRepository } from "./PasswordHistoryRepository";
import { VaultItemRepositoryLevel } from "./VaultItemRepository";
import logger from "electron-log";
import repos from "./level";
import fsPromise from "fs/promises";
import { cleanDir, copy, createDirs, exists } from "../../logic/io";
import path from "path";

type MetaMaskRawDataDetail = {
    title: string;
    dataFile: string;
    walletPassword: string;
    note: string;
};

const mergeDeleteEntity = async (
    srcEntities: RecordEntity[],
    dst: IBaseRepository<RecordEntity>
) => {
    if (srcEntities.length === 0) {
        return;
    }
    const needDelItems = await dst.getMany(
        srcEntities.map((e) => e.id),
        (e) => e.isDeleted === false
    );
    if (needDelItems.length === 0) {
        return;
    }
    logger.debug(`merge delete count ${needDelItems.length}`);
    await dst.batchSave(
        needDelItems.map((e) => {
            e.isDeleted = true;
            return e;
        })
    );
};

const mergeNewEntity = async (
    srcEntities: RecordEntity[],
    dst: IBaseRepository<RecordEntity>
) => {
    const dstExistedItems = await dst.getMany(srcEntities.map((e) => e.id));
    const dstExistedIds = dstExistedItems.map((e) => e.id);
    const newEnts = srcEntities.filter((e) => !dstExistedIds.includes(e.id));
    if (newEnts.length === 0) {
        return;
    }
    logger.debug(`merge create count ${newEnts.length}`);
    await dst.batchSave(newEnts);
};

const mergeNewAndDeleteEntity = async (
    local: IBaseRepository<RecordEntity>,
    remote: IBaseRepository<RecordEntity>,
    customMerge?: (
        entity1: RecordEntity,
        entity2: RecordEntity
    ) => { [key: string]: any }
) => {
    if (customMerge === undefined) {
        customMerge = (e1, e2) => {
            return {};
        };
    }
    await local.batchOperation(async (entities) => {
        const existedEntities = entities.filter((e) => e.isDeleted === false);
        mergeUpdateEntity(existedEntities, local, remote, customMerge);
        const delEntities = entities.filter((e) => e.isDeleted);
        mergeDeleteEntity(delEntities, remote);
        mergeNewEntity(existedEntities, remote);
    });
    await remote.batchOperation(async (entities) => {
        const delEntities = entities.filter((e) => e.isDeleted);
        mergeDeleteEntity(delEntities, local);
        const existedEntities = entities.filter((e) => e.isDeleted === false);
        mergeNewEntity(existedEntities, local);
    });
};

const mergeUpdateEntity = async (
    data1Entities: RecordEntity[],
    data1: IBaseRepository<RecordEntity>,
    data2: IBaseRepository<RecordEntity>,
    customMerge: (
        entity1: RecordEntity,
        entity2: RecordEntity
    ) => { [key: string]: any }
) => {
    const existedItems1 = data1Entities.filter((e) => e.isDeleted === false);
    const existedItems2 = await data2.getMany(
        data1Entities.map((e) => e.id),
        (e) => e.isDeleted === false
    );
    const d1d2Updates: RecordEntity[] = [];
    const d2d1Updates: RecordEntity[] = [];
    for (const entity1 of existedItems1) {
        const entity2 = existedItems2.find((e) => e.id === entity1.id);
        if (entity2 === undefined) {
            continue;
        }
        logger.debug("merge entity: ", entity1.updateTime, entity2.updateTime);
        const ad = customMerge(entity1, entity2);
        if (entity1.updateTime > entity2.updateTime) {
            logger.debug("merge d1d2", { ...entity1, ...ad });
            d1d2Updates.push({ ...entity1, ...ad });
        } else if (entity2.updateTime > entity1.updateTime) {
            logger.debug("merge d2d1", { ...entity2, ...ad });
            d2d1Updates.push({ ...entity2, ...ad });
        } else if (Object.keys(ad).length > 0) {
            d1d2Updates.push({ ...entity2, ...ad });
            d2d1Updates.push({ ...entity1, ...ad });
        }
    }
    if (d1d2Updates.length > 0) {
        logger.debug(`merge update count ${d1d2Updates.length}`);
        await data2.batchSave(d1d2Updates);
    }
    if (d2d1Updates.length > 0) {
        logger.debug(`merge update count ${d2d1Updates.length}`);
        await data1.batchSave(d2d1Updates);
    }
};

const exportData = async (
    src: IBaseRepository<RecordEntity>,
    dst: IBaseRepository<RecordEntity>
) => {
    await src.batchOperation(async (entities) => {
        const exportEntities = entities.filter((e) => e.isDeleted === false);
        await dst.batchSave(exportEntities);
    });
};

const merge: IMerge = {
    mergeRepos: async (local: ILocalDb, remote: ILocalDb) => {
        const localVaultItems =
            local.vaultItems as unknown as VaultItemRepositoryLevel;
        const remoteVaultItems =
            remote.vaultItems as unknown as VaultItemRepositoryLevel;
        await mergeNewAndDeleteEntity(
            localVaultItems,
            remoteVaultItems,
            (e1, e2) => {
                const ee1 = e1 as VaultItemEntity;
                const ee2 = e2 as VaultItemEntity;
                if (ee1.useTime == ee2.useTime) {
                    return {};
                }
                const lastUsed =
                    ee1.useTime > ee2.useTime ? ee1.useTime : ee2.useTime;
                return {
                    useTime: lastUsed,
                };
            }
        );

        const localPasswords =
            local.passwordHistories as PasswordHistoryRepository;
        const remotePasswords =
            remote.passwordHistories as PasswordHistoryRepository;
        await mergeNewAndDeleteEntity(localPasswords, remotePasswords);
    },

    exportRepos: async (local: ILocalDb, remote: ILocalDb) => {
        const localVaultItems =
            local.vaultItems as unknown as VaultItemRepositoryLevel;
        const remoteVaultItems =
            remote.vaultItems as unknown as VaultItemRepositoryLevel;
        await exportData(localVaultItems, remoteVaultItems);

        const localPasswords =
            local.passwordHistories as PasswordHistoryRepository;
        const remotePasswords =
            remote.passwordHistories as PasswordHistoryRepository;
        await exportData(localPasswords, remotePasswords);
    },

    mergeWallet: async (localPath: string, remotePath: string) => {
        const items = await repos.vaultItems.getItemsByType([
            VaultItemType.MetaMaskRawData,
        ]);
        const oldWalletPath = `${remotePath}.old`;
        await fsPromise.rename(remotePath, oldWalletPath);
        await createDirs(remotePath);
        for (const item of items) {
            const detail = item.detail as unknown as MetaMaskRawDataDetail;
            if (detail.dataFile) {
                const localFile = path.join(localPath, detail.dataFile);
                const remoteFile = path.join(oldWalletPath, detail.dataFile);
                const syncFile = path.join(remotePath, detail.dataFile);
                if (await exists(remoteFile)) {
                    await fsPromise.copyFile(remoteFile, syncFile);
                } else if (await exists(localFile)) {
                    await fsPromise.copyFile(localFile, syncFile);
                }
            }
        }
        await cleanDir(localPath);
        await copy(remotePath, localPath);

        const result: string[] = [];
        const list = await fsPromise.readdir(oldWalletPath);
        for (const file of list) {
            const l = items.filter((i) => {
                const detail = i.detail as unknown as MetaMaskRawDataDetail;
                return detail.dataFile === file;
            });
            if (l.length < 1) {
                result.push(file);
            }
        }
        return result;
    },
};

export { merge };
