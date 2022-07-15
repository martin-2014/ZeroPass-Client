export interface VaultItemModel {
    id: string;
    name: string;
    description: string;
    star: boolean;
    alias: string;
    type: number;
    lastModified: string;
    lastUsed: string;
    detail: any;
    tags: string[];
}

export interface PasswordHistoryModel {
    id: string;
    password: string;
    source: number;
    createTime: string;
    description: string;
}
