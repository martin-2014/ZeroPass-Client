export type EntityType = "vaultItem" | "passwordHistory";

export interface RecordEntity {
    id: string;
    updateTime: number;
    createTime: number;
    isDeleted: boolean;
}

export enum VaultItemType {
    Login = 0,
    Note = 1,
    Credit = 2,
    PersonalInfo = 3,
    MetaMaskRawData = 4,
    MetaMaskMnemonicPhrase = 5,
    Addresses = 6,
}

export interface VaultItemEntity extends RecordEntity {
    name: string;
    description: string;
    detail: string;
    type: VaultItemType;
    star: boolean;
    tags: string[];
    useTime: number;
}

export interface PasswordHistoryEntity extends RecordEntity {
    password: string;
    source: number;
    description: string;
}
