import { Level } from "level";
import { VaultItemRepositoryLevel } from "./VaultItemRepository";
import {
    IAppConfigRepository,
    ILocalDb,
    IPasswordHistoryRepository,
    IVaultItemRepository,
} from "../interfaces";
import { PasswordHistoryRepository } from "./PasswordHistoryRepository";
import { AppConfigRepository } from "./AppConfigRepository";
import { merge } from "./merge";

class LevelDb implements ILocalDb {
    private db: Level;
    private vaultItemRepository: IVaultItemRepository;
    private passwordHistoryRepository: IPasswordHistoryRepository;
    private appconfigRepository: IAppConfigRepository;

    private checkDbOpened = (resolve, reject) => {
        const self = this;
        setTimeout(() => {
            if (self.db.status === "open") {
                self.vaultItemRepository = new VaultItemRepositoryLevel(
                    self.db
                );
                self.passwordHistoryRepository = new PasswordHistoryRepository(
                    self.db
                );
                self.appconfigRepository = new AppConfigRepository(self.db);
                resolve();
            } else if (self.db.status === "opening") {
                self.checkDbOpened(resolve, reject);
            } else {
                reject("Failed to open db");
            }
        }, 50);
    };

    async switch(path: string): Promise<void> {
        if (this.db !== undefined) {
            await this.close();
        }
        this.db = new Level(path, { valueEncoding: "json" });
        return new Promise<void>(this.checkDbOpened);
    }

    async close(): Promise<void> {
        await this.db?.close();
        this.db = undefined;
        this.vaultItemRepository = undefined;
    }

    get vaultItems() {
        if (this.db?.status === "open") {
            return this.vaultItemRepository;
        } else {
            return undefined;
        }
    }

    get passwordHistories() {
        if (this.db?.status === "open") {
            return this.passwordHistoryRepository;
        } else {
            return undefined;
        }
    }

    get appConfigs() {
        if (this.db?.status === "open") {
            return this.appconfigRepository;
        } else {
            return undefined;
        }
    }

    async merge(path: string): Promise<void> {
        const remoteRepos = new LevelDb();
        try {
            await remoteRepos.switch(path);
            await merge.mergeRepos(this, remoteRepos);
        } finally {
            await remoteRepos.close();
        }
    }

    async export(path: string): Promise<void> {
        const exRepos = new LevelDb();
        try {
            await exRepos.switch(path);
            await merge.exportRepos(this, exRepos);
        } finally {
            await exRepos.close();
        }
    }

    async mergeWallet(local: string, remote: string): Promise<string[]> {
        return await merge.mergeWallet(local, remote);
    }

    get dbLocation() {
        return this.db?.location;
    }
}

const repos: ILocalDb = new LevelDb();
export default repos;
