import { repos } from "../repositories";
import {
    convertEntityToPwdHisModel,
    convertPwdHisModelToEntity,
    convertToVaultItemModel,
    convertVaultItemModelToEntity,
    convertToEntity,
} from "./models/converter";
import { v4 as uuid } from "uuid";
import logger from "electron-log";
import { app, dialog } from "electron";
import {
    ipfsServer,
    ShareFolderSyncWorkflow,
    syncStatusMachine,
} from "./synchronization";
import path from "path";
import { ISyncWorkFlow } from "./synchronization/definition";
import { IpfsSyncWorkflow } from "./synchronization/ipfsSync";
import { dateToYYYYMMDDHHMMSS, getMainWindow, promiseDelay } from "../utils";

const propsCopy = (src: any, dst: any) => {
    Object.keys(src).forEach((k) => {
        if (k in dst) {
            src[k] = dst[k];
        }
    });
    return dst;
};

const propsMerge = (src: any, dst: any) => {
    let entity = src;
    Object.entries(dst).forEach(([key, value]) => {
        entity[key] = value;
    });
    return entity;
};

const errRes = (errId: string): Message.WebResponseData => {
    return {
        errId: errId,
        fail: true,
    };
};

const succRes = (payload?: any): Message.WebResponseData => {
    return {
        payload: payload,
        fail: false,
    };
};

const createId = () => uuid().toString().replace(/-/g, "");

const getStoragePath = () => `${process.env.localappdata}/zeropass`;

type ParamsType = { [key: string]: any };

const webRequestController: {
    [key in Message.WebRquestMethod]: (
        params: ParamsType
    ) => Promise<Message.WebResponseData>;
} = {
    getAllVaultItems: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const entities = await repos.vaultItems.getAll();
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    },

    getVaultItems: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const entities = await repos.vaultItems.getItemsByType(
            params?.types ?? []
        );
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    },

    createVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const entity = convertVaultItemModelToEntity(params?.data);
        entity.id = createId();
        entity.createTime = Date.now();
        entity.isDeleted = false;
        entity.updateTime = Date.now();
        entity.useTime = Date.now();
        const newEnt = await repos.vaultItems.create(entity);
        return succRes(convertToVaultItemModel(newEnt));
    },

    updateVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const item = params?.data as VaultItemModel;
        const entity = await repos.vaultItems.findById(item.id);
        if (entity) {
            propsCopy(entity, item);
            entity.updateTime = Date.now();
            await repos.vaultItems.update(entity);
            return succRes(convertToVaultItemModel(entity));
        }
        return errRes("err_app_not_found");
    },

    patchVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const model = params?.data as VaultItemModel;
        const targetEntity = convertToEntity(model);
        const sourceEntity = await repos.vaultItems.findById(model.id);
        if (sourceEntity) {
            const mergedEntity = propsMerge(sourceEntity, targetEntity);
            await repos.vaultItems.update(mergedEntity);
            return succRes(convertToVaultItemModel(mergedEntity));
        }
        return errRes("err_app_not_found");
    },

    deleteVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const result = await repos.vaultItems.delete(params?.id);
        return result ? succRes() : errRes("err_app_not_found");
    },

    getVaultItemTags: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        let result = await repos.vaultItems.getTags();
        if (result) {
            const tmp = [];
            result.forEach((tag) => {
                tmp.push({ id: tag, name: tag });
            });
            result = tmp;
        }

        return succRes(result);
    },

    favoriteVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        await repos.vaultItems.favorite(params?.id, true);
        return succRes();
    },

    unfavoriteVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        await repos.vaultItems.favorite(params?.id, false);
        return succRes();
    },

    getFavoriteVaultItem: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const entities = await repos.vaultItems.getFavoriteItems();
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    },

    getVaultItemsByTag: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const entities = await repos.vaultItems.getItemsByTag(params?.tag);
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    },

    getVaultItemsById: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        let result: any = await repos.vaultItems.findById(params?.id);
        if (!result) {
            return errRes("err_app_not_found");
        }
        result = convertToVaultItemModel(result);
        result = { ...result, ...result.detail };
        return succRes(result);
    },

    logout: async (params: ParamsType): Promise<Message.WebResponseData> => {
        await repos.close();
        return succRes();
    },

    login: async (params: ParamsType): Promise<Message.WebResponseData> => {
        const dataPath = `${getStoragePath()}/data/${params.id}/db`;
        await repos.switch(dataPath);
        return succRes();
    },

    addPwdHistory: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const entity = convertPwdHisModelToEntity(params?.data);
        entity.id = createId();
        entity.createTime = Date.now();
        entity.updateTime = Date.now();
        entity.isDeleted = false;
        await repos.passwordHistories.create(entity);
        return succRes(convertEntityToPwdHisModel(entity));
    },

    deletePwdHistory: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        await repos.passwordHistories.delete(params.id);
        return succRes();
    },

    deleteAllPwdHistories: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        await repos.passwordHistories.deleteAll();
        return succRes();
    },

    getPwdHistories: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const list = await repos.passwordHistories.list();
        const result = list.map((e) => convertEntityToPwdHisModel(e));
        return succRes(result);
    },

    exportData: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const info = params as Message.ExportParams;
        const exportPath = path.join(
            app.getPath("temp"),
            "zeropass",
            "exports",
            createId()
        );
        const saveRes = await dialog.showSaveDialog(getMainWindow(), {
            properties: ["showOverwriteConfirmation"],
            filters: [{ name: "Zero Password Data", extensions: ["zpd"] }],
            defaultPath: `Backup${dateToYYYYMMDDHHMMSS(new Date())}.zpd`,
        });
        if (!saveRes.canceled) {
            await repos.export(
                exportPath,
                saveRes.filePath,
                info.userId,
                info.domainId
            );
        } else {
            return errRes("err_opt_cancel");
        }
        return succRes();
    },
    importData: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const info = params as Message.ImportParams;
        const importPath = path.join(
            app.getPath("temp"),
            "zeropass",
            "imports",
            createId()
        );
        const openRes = await dialog.showOpenDialog(getMainWindow(), {
            properties: ["openFile"],
            filters: [{ name: "Zero Password Data", extensions: ["zpd"] }],
        });
        if (!openRes.canceled) {
            const err = await repos.import(
                importPath,
                openRes.filePaths[0],
                info.userId,
                info.domainId,
                info.overwrite
            );
            if (err) {
                return errRes(err);
            }
        } else {
            return errRes("err_opt_cancel");
        }
        return succRes();
    },

    mergeData: async (params: ParamsType): Promise<Message.WebResponseData> => {
        if (syncStatusMachine.isStarted) {
            logger.debug("sync have been started");
            return succRes();
        }
        let sync: ISyncWorkFlow;
        logger.info("merge data: ", params);
        const param = params as Message.SyncParams;
        if (params["type"] == "ipfs") {
            sync = new IpfsSyncWorkflow(param.method);
        } else {
            return errRes("err_wrong_sync_type");
        }

        syncStatusMachine.run(sync);
        while (
            !syncStatusMachine.isSyncing &&
            syncStatusMachine.errorId === undefined
        ) {
            await promiseDelay(100);
        }
        if (syncStatusMachine.errorId === "") {
            return succRes();
        } else {
            return errRes(syncStatusMachine.errorId);
        }
    },

    getMergeStatus: async (
        params: ParamsType
    ): Promise<Message.WebResponseData> => {
        const lastSync = await repos.appConfigs.getLastSyncStatus();
        const result: Message.SyncInfoData = {
            lastSyncInfo: lastSync,
            status: syncStatusMachine.status,
            lastError: syncStatusMachine.lastError,
            lastMessage: syncStatusMachine.lastMessage,
            errorId: syncStatusMachine.errorId,
            type: syncStatusMachine.type as Message.SyncType,
        };
        return succRes(result);
    },
};

const webRequestRouter = async (
    req: Message.WebRequestData
): Promise<Message.WebResponseData> => {
    const startTime = Date.now();
    let result: Message.WebResponseData;
    try {
        result = await webRequestController[req.method](req.params);
    } catch (e) {
        logger.error(e);
        result = errRes("err_server_error");
    }
    logger.debug(
        `web local request ${req.method} spend ${Date.now() - startTime} ms`
    );
    return result;
};

export { webRequestRouter };
