import {
    PasswordHistoryEntity,
    VaultItemEntity,
} from "../../repositories/entities";
import { PasswordHistoryModel, VaultItemModel } from "./model";

enum dataType {
    string = 0,
    date = 1,
}

const modelToEntityMap = {
    id: { name: "id", type: dataType.string },
    name: { name: "name", type: dataType.string },
    description: { name: "description", type: dataType.string },
    star: { name: "star", type: dataType.string },
    type: { name: "type", type: dataType.string },
    detail: { name: "detail", type: dataType.string },
    tags: { name: "tags", type: dataType.string },
    lastModified: { name: "updateTime", type: dataType.date },
    lastUsed: { name: "useTime", type: dataType.date },
};

const convertToVaultItemModel = (entity: VaultItemEntity) => {
    try {
        let m: VaultItemModel = {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            star: entity.star,
            alias: undefined,
            type: entity.type,
            lastModified: new Date(entity.updateTime)
                .toISOString()
                .substring(0, 19),
            lastUsed: entity.useTime
                ? new Date(entity.useTime).toISOString().substring(0, 19)
                : undefined,
            detail: entity.detail,
            tags: entity.tags ?? [],
        };
        const tags = m.tags.map((tag) => {
            return { id: tag, name: tag };
        });
        return { ...m, tags: tags };
    } catch (ex) {
        console.log(entity);
    }
};

const convertVaultItemModelToEntity = (model: VaultItemModel) => {
    const entity: VaultItemEntity = {
        id: model.id,
        name: model.name,
        description: model.description,
        star: model.star,
        type: model.type,
        detail: model.detail,
        tags: model.tags ?? [],
        createTime: undefined,
        updateTime: undefined,
        useTime: undefined,
        isDeleted: false,
    };
    return entity;
};

const convertToEntity = (model: VaultItemModel) => {
    const getValue = (type, value) => {
        switch (type) {
            case dataType.date:
                return Date.parse(value);
            default:
                return value;
        }
    };
    const entity = {};
    Object.entries(model).forEach(([key, value]) => {
        if (key in modelToEntityMap) {
            const map = modelToEntityMap[key];
            entity[map.name] = getValue(map.type, value);
        }
    });
    return entity;
};

const convertPwdHisModelToEntity = (model: PasswordHistoryModel) => {
    const entity: PasswordHistoryEntity = {
        id: model.id ?? "",
        password: model.password,
        source: model.source,
        description: model.description,
        createTime: undefined,
        isDeleted: false,
        updateTime: undefined,
    };
    return entity;
};

const convertEntityToPwdHisModel = (entity: PasswordHistoryEntity) => {
    const model: PasswordHistoryModel = {
        id: entity.id,
        password: entity.password,
        source: entity.source,
        description: entity.description,
        createTime: new Date(entity.createTime).toISOString().substring(0, 19),
    };
    return model;
};

export {
    convertToVaultItemModel,
    convertVaultItemModelToEntity,
    convertPwdHisModelToEntity,
    convertEntityToPwdHisModel,
    convertToEntity,
};
