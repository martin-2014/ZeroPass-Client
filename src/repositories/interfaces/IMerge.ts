import { ILocalDb } from "./ILocalDB";

export interface IMerge {
    exportRepos: (local: ILocalDb, remote: ILocalDb) => Promise<void>;
    exportWallet: (localPath: string, remotePath: string) => Promise<void>;
    importRepos: (
        src: ILocalDb,
        dst: ILocalDb,
        overwrite: boolean
    ) => Promise<void>;
    importWallet: (
        repos: ILocalDb,
        srcPath: string,
        dst: string
    ) => Promise<void>;
}
