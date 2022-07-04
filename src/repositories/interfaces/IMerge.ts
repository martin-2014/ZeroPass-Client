import { ILocalDb } from "./ILocalDB";

export interface IMerge {
    mergeRepos: (local: ILocalDb, remote: ILocalDb) => Promise<void>;
    exportRepos: (local: ILocalDb, remote: ILocalDb) => Promise<void>;
    mergeWallet: (localPath: string, remotePath: string) => Promise<string[]>;
}
