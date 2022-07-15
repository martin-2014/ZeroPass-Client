import { RecordEntity, VaultItemType } from "../entities";
import { IBaseRepository, ILocalDb, IMerge } from "../interfaces";
import fsPromise from "fs/promises";
import { copy, createDirs, exists } from "../../logic/io";
import path from "path";

type MetaMaskRawDataDetail = {
    title: string;
    dataFile: string;
    walletPassword: string;
    note: string;
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

const importWallet = async (
    repos: ILocalDb,
    srcPath: string,
    dstPath: string
) => {
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

class Merge implements IMerge {
    constructor() {}
    async exportRepos(local: ILocalDb, remote: ILocalDb) {
        await exportData(local.vaultItems, remote.vaultItems);
        await exportData(local.passwordHistories, remote.passwordHistories);
    }

    async exportWallet(localPath: string, exportPath: string) {
        await createDirs(exportPath);
        await copy(localPath, exportPath);
    }

    async importRepos(src: ILocalDb, dst: ILocalDb, overwrite: boolean) {
        await importData(src.vaultItems, dst.vaultItems, overwrite);

        await importData(
            src.passwordHistories,
            dst.passwordHistories,
            overwrite
        );
    }

    async importWallet(repos: ILocalDb, srcPath: string, dstPath: string) {
        await importWallet(repos, srcPath, dstPath);
    }
}

export { Merge };
