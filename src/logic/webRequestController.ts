import {
    convertEntityToPwdHisModel,
    convertPwdHisModelToEntity,
    convertToVaultItemModel,
    convertVaultItemModelToEntity,
    convertToEntity,
} from "./models/converter";
import { v4 as uuid } from "uuid";
import { app, dialog } from "electron";
import path from "path";
import { dateToYYYYMMDDHHMMSS, getMainWindow, promiseDelay } from "../utils";
import { ILocalDb } from "../repositories/interfaces";
import { VaultItemModel, PasswordHistoryModel } from "./models/model";

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

type IWebRequestController = {
    [key in Message.WebRquestMethod]: (
        params: ParamsType
    ) => Promise<Message.WebResponseData>;
};

class WebRequestController implements IWebRequestController {
    private repos: ILocalDb;

    constructor(_repos: ILocalDb) {
        this.repos = _repos;
    }

    async getAllVaultItems(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const entities = await this.repos.vaultItems.getAll();
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    }

    async getVaultItems(params: ParamsType): Promise<Message.WebResponseData> {
        const entities = await this.repos.vaultItems.getItemsByType(
            params?.types ?? []
        );
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    }

    async createVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const entity = convertVaultItemModelToEntity(params?.data);
        entity.id = createId();
        entity.createTime = Date.now();
        entity.isDeleted = false;
        entity.updateTime = Date.now();
        entity.useTime = Date.now();
        const newEnt = await this.repos.vaultItems.create(entity);
        return succRes(convertToVaultItemModel(newEnt));
    }

    async importVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const items = params.data as [];
        const entities = items.map((item) => {
            const entity = convertVaultItemModelToEntity(item);
            entity.id = createId();
            entity.createTime = Date.now();
            entity.isDeleted = false;
            entity.updateTime = Date.now();
            entity.useTime = Date.now();
            return entity;
        });
        try {
            await this.repos.vaultItems.batchSave(entities);
            return succRes();
        } catch {
            return errRes("");
        }
    }

    async updateVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const item = params?.data as VaultItemModel;
        const entity = await this.repos.vaultItems.findById(item.id);
        if (entity) {
            propsCopy(entity, item);
            entity.updateTime = Date.now();
            await this.repos.vaultItems.update(entity);
            return succRes(convertToVaultItemModel(entity));
        }
        return errRes("err_app_not_found");
    }

    async patchVaultItem(params: ParamsType): Promise<Message.WebResponseData> {
        const model = params?.data as VaultItemModel;
        const targetEntity = convertToEntity(model);
        const sourceEntity = await this.repos.vaultItems.findById(model.id);
        if (sourceEntity) {
            const mergedEntity = propsMerge(sourceEntity, targetEntity);
            await this.repos.vaultItems.update(mergedEntity);
            return succRes(convertToVaultItemModel(mergedEntity));
        }
        return errRes("err_app_not_found");
    }

    async deleteVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const result = await this.repos.vaultItems.delete(params?.id);
        return result ? succRes() : errRes("err_app_not_found");
    }

    async getVaultItemTags(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        let result = await this.repos.vaultItems.getTags();
        if (result) {
            const tmp = [];
            result.forEach((tag) => {
                tmp.push({ id: tag, name: tag });
            });
            result = tmp;
        }

        return succRes(result);
    }

    async favoriteVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        await this.repos.vaultItems.favorite(params?.id, true);
        return succRes();
    }

    async unfavoriteVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        await this.repos.vaultItems.favorite(params?.id, false);
        return succRes();
    }

    async getFavoriteVaultItem(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const entities = await this.repos.vaultItems.getFavoriteItems();
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    }

    async getVaultItemsByTag(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const entities = await this.repos.vaultItems.getItemsByTag(params?.tag);
        const result = entities.map((v) => convertToVaultItemModel(v));
        return succRes(result);
    }

    async getVaultItemsById(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        let result: any = await this.repos.vaultItems.findById(params?.id);
        if (!result) {
            return errRes("err_app_not_found");
        }
        result = convertToVaultItemModel(result);
        result = { ...result, ...result.detail };
        return succRes(result);
    }

    async logout(params: ParamsType): Promise<Message.WebResponseData> {
        await this.repos.close();
        return succRes();
    }

    async login(params: ParamsType): Promise<Message.WebResponseData> {
        const dataPath = `${getStoragePath()}/data/${params.id}/db`;
        await this.repos.switch(dataPath);
        return succRes();
    }

    async addPwdHistory(params: ParamsType): Promise<Message.WebResponseData> {
        const entity = convertPwdHisModelToEntity(params?.data);
        entity.id = createId();
        entity.createTime = Date.now();
        entity.updateTime = Date.now();
        entity.isDeleted = false;
        await this.repos.passwordHistories.create(entity);
        return succRes(convertEntityToPwdHisModel(entity));
    }

    async deletePwdHistory(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        await this.repos.passwordHistories.delete(params.id);
        return succRes();
    }

    async deleteAllPwdHistories(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        await this.repos.passwordHistories.deleteAll();
        return succRes();
    }

    async getPwdHistories(
        params: ParamsType
    ): Promise<Message.WebResponseData> {
        const list = await this.repos.passwordHistories.list();
        const result = list.map((e) => convertEntityToPwdHisModel(e));
        return succRes(result);
    }

    async exportData(params: ParamsType): Promise<Message.WebResponseData> {
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
            await this.repos.export(
                exportPath,
                saveRes.filePath,
                info.userId,
                info.domainId
            );
        } else {
            return errRes("err_opt_cancel");
        }
        return succRes();
    }
    async importData(params: ParamsType): Promise<Message.WebResponseData> {
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
            const err = await this.repos.import(
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
    }
}

export { WebRequestController, errRes, succRes };
