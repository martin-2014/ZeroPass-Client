import { ILocalDb } from "./ILocalDB";

export interface IMerge {
    mergeRepos: (local: ILocalDb, remote: ILocalDb) => Promise<void>;
    exportRepos: (local: ILocalDb, remote: ILocalDb) => Promise<void>;
    mergeWallet: (localPath: string, remotePath: string) => Promise<string[]>;
    exportWallet: (localPath: string, remotePath: string) => Promise<void>;
    importRepos: (
        src: ILocalDb,
        dst: ILocalDb,
        overwrite: boolean
    ) => Promise<void>;
    importWallet: (srcPath: string, dst: string) => Promise<void>;
}
