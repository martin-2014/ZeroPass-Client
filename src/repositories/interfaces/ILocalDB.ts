import { IAppConfigRepository } from "./IAppConfigRepository";
import { IPasswordHistoryRepository } from "./IPasswordHistoryRepository";
import { IVaultItemRepository } from "./IVaultItemRepository";

export interface ILocalDb {
    switch: (path: string) => Promise<void>;
    close: () => Promise<void>;
    merge: (path: string) => Promise<void>;
    export: (path: string) => Promise<void>;
    mergeWallet: (local: string, remote: string) => Promise<string[]>;
    dbLocation: string;
    vaultItems: IVaultItemRepository;
    passwordHistories: IPasswordHistoryRepository;
    appConfigs: IAppConfigRepository;
}
