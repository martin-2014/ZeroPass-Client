import { VaultItemEntity, VaultItemType } from "../entities";

export interface IVaultItemRepository {
    getAll: () => Promise<VaultItemEntity[]>;
    findById: (id: string) => Promise<VaultItemEntity>;
    update: (item: VaultItemEntity) => Promise<VaultItemEntity>;
    create: (item: VaultItemEntity) => Promise<VaultItemEntity>;
    delete: (id: string) => Promise<boolean>;
    getTags: () => Promise<string[]>;
    favorite: (id: string, fav: boolean) => Promise<void>;
    getItemsByType: (types: VaultItemType[]) => Promise<VaultItemEntity[]>;
    getItemsByTag: (tag: string) => Promise<VaultItemEntity[]>;
    getFavoriteItems: () => Promise<VaultItemEntity[]>;
}
