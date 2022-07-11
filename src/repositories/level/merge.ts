import { RecordEntity, VaultItemType } from "../entities";
import { IBaseRepository, ILocalDb, IMerge } from "../interfaces";
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

const mergeNewAndDeleteEntity = async <T extends RecordEntity>(
    local: IBaseRepository<T>,
    remote: IBaseRepository<T>,
    customMerge?: (entity1: T, entity2: T) => { [key: string]: any }
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
        const ad = customMerge(entity1, entity2);
        if (entity1.updateTime > entity2.updateTime) {
            d1d2Updates.push({ ...entity1, ...ad });
        } else if (entity2.updateTime > entity1.updateTime) {
            d2d1Updates.push({ ...entity2, ...ad });
        } else if (Object.keys(ad).length > 0) {
            d1d2Updates.push({ ...entity2, ...ad });
            d2d1Updates.push({ ...entity1, ...ad });
        }
    }
    if (d1d2Updates.length > 0) {
        await data2.batchSave(d1d2Updates);
    }
    if (d2d1Updates.length > 0) {
        await data1.batchSave(d2d1Updates);
    }
};

const importData = async (
    src: IBaseRepository<RecordEntity>,
    dst: IBaseRepository<RecordEntity>,
    overwrite: boolean
) => {
    const updatedIds: string[] = [];
    await dst.batchOperation(async (entities) => {
        const srcEntList = await src.getMany(entities.map((e) => e.id));
        const newList = await entities.map((dstEnt) => {
            const srcEnt = srcEntList.find((e) => e.id === dstEnt.id);
            if (srcEnt === undefined) {
                if (overwrite) {
                    dstEnt.isDeleted = true;
                }
                return dstEnt;
            } else {
                return srcEnt;
            }
        });
        if (newList.length > 0) {
            updatedIds.push(...newList.map((e) => e.id));
            await dst.batchSave(newList);
        }
    });
    await src.batchOperation(async (entities) => {
        const newList = entities.filter((e) => !updatedIds.includes(e.id));
        if (newList.length > 0) {
            await dst.batchSave(newList);
        }
    });
};

const importWallet = async (srcPath: string, dstPath: string) => {
    const entities = await repos.vaultItems.getItemsByType([
        VaultItemType.MetaMaskRawData,
    ]);
    const existedFiles: string[] = (await exists(dstPath))
        ? (await fsPromise.readdir(dstPath)).map((f) => path.join(dstPath, f))
        : [];
    const validFiles: string[] = [];
    for (const entity of entities) {
        const detail = entity.detail as unknown as MetaMaskRawDataDetail;
        const srcFile = path.join(srcPath, detail.dataFile);
        const dstFile = path.join(dstPath, detail.dataFile);
        await createDirs(dstPath);
        if (await exists(srcFile)) {
            await copy(srcFile, dstFile);
        }
        validFiles.push(dstFile);
    }
    const delFiles = existedFiles.filter((f) => validFiles.indexOf(f) < 0);
    // logger.debug("del files", delFiles);
    delFiles.forEach(async (f) => {
        await fsPromise.rm(f);
    });
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
        await mergeNewAndDeleteEntity(
            local.vaultItems,
            remote.vaultItems,
            (e1, e2) => {
                if (e1.useTime == e2.useTime) {
                    return {};
                }
                const lastUsed =
                    e1.useTime > e2.useTime ? e1.useTime : e2.useTime;
                return {
                    useTime: lastUsed,
                };
            }
        );

        await mergeNewAndDeleteEntity(
            local.passwordHistories,
            remote.passwordHistories
        );
    },

    exportRepos: async (local: ILocalDb, remote: ILocalDb) => {
        await exportData(local.vaultItems, remote.vaultItems);
        await exportData(local.passwordHistories, remote.passwordHistories);
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
    exportWallet: async (localPath: string, exportPath: string) => {
        await createDirs(exportPath);
        await copy(localPath, exportPath);
    },
    importRepos: async (src: ILocalDb, dst: ILocalDb, overwrite: boolean) => {
        await importData(src.vaultItems, dst.vaultItems, overwrite);

        await importData(
            src.passwordHistories,
            dst.passwordHistories,
            overwrite
        );
    },
    importWallet: async (srcPath: string, dstPath: string) => {
        await importWallet(srcPath, dstPath);
    },
};

export { merge };
