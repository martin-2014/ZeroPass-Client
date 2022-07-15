import { Level } from "level";
import { VaultItemRepositoryLevel } from "./VaultItemRepository";
import {
    IAppConfigRepository,
    ILocalDb,
    IMerge,
    IPasswordHistoryRepository,
    IVaultItemRepository,
} from "../interfaces";
import { PasswordHistoryRepository } from "./PasswordHistoryRepository";
import { AppConfigRepository } from "./AppConfigRepository";
import { Merge } from "./merge";
import path from "path";
import { copy, createDirs, sevenZip, exists } from "../../logic/io";
import fsPromise from "fs/promises";
import { dataStoreUtils } from "./common";

class LevelDb implements ILocalDb {
    private db: Level;
    private vaultItemRepository: IVaultItemRepository;
    private passwordHistoryRepository: IPasswordHistoryRepository;
    private appconfigRepository: IAppConfigRepository;
    private merge: IMerge;

    constructor(_merge: IMerge) {
        this.merge = _merge;
    }

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

    async switch(dbPath: string): Promise<void> {
        if (this.db !== undefined) {
            await this.close();
        }
        this.db = new Level(dbPath, { valueEncoding: "json" });
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

    async export(
        exportPath: string,
        filePath: string,
        userId: number,
        domainId: number
    ): Promise<void> {
        const exRepos: ILocalDb = new LevelDb(this.merge);
        const dbPath = dataStoreUtils.dbPath(exportPath);
        const dbFilePath = dataStoreUtils.dbFile(exportPath);
        const exportWalletPath = dataStoreUtils.walletPath(exportPath);
        const localWalletPath = dataStoreUtils.walletPath(
            path.join(this.dbLocation, "..")
        );
        const packagePath = dataStoreUtils.packagePath(exportPath);
        const packageFile = dataStoreUtils.packageFile(exportPath);
        const infoPath = dataStoreUtils.userInfo(exportPath);
        try {
            try {
                await exRepos.switch(dbPath);
                await this.merge.exportRepos(this, exRepos);
                await this.merge.exportWallet(
                    localWalletPath,
                    exportWalletPath
                );
                await exRepos.close();
            } finally {
                await exRepos.close();
            }
            await fsPromise.writeFile(
                infoPath,
                JSON.stringify({ userId: userId, domainId: domainId })
            );
            await createDirs(packagePath);
            await sevenZip.compress(`${dbPath}/*`, dbFilePath);
            await sevenZip.compress(dbFilePath, packageFile);
            await sevenZip.compress(exportWalletPath, packageFile);
            await sevenZip.compress(infoPath, packageFile);
            await copy(packageFile, filePath);
        } finally {
            await fsPromise.rm(exportPath, { recursive: true });
        }
    }

    async import(
        importPath: string,
        filePath: string,
        userId: number,
        domainId: number,
        overwrite: boolean
    ): Promise<string> {
        const imRepos: ILocalDb = new LevelDb(this.merge);
        const dbPath = dataStoreUtils.dbPath(importPath);
        const dbFile = dataStoreUtils.dbFile(importPath);
        const localWalletPath = dataStoreUtils.walletPath(
            path.join(this.dbLocation, "..")
        );
        const remoteWalletPath = dataStoreUtils.walletPath(importPath);
        const infoPath = dataStoreUtils.userInfo(importPath);
        try {
            // await createDirs(importPath);
            await createDirs(dbPath);
            await sevenZip.extract(filePath, importPath);

            if (!(await exists(infoPath))) {
                return "err_import_data_user_incorrect";
            }
            const info = JSON.parse(
                (await fsPromise.readFile(infoPath)).toString()
            );
            if (info.userId !== userId || info.domainId !== domainId) {
                return "err_import_data_user_incorrect";
            }

            await sevenZip.extract(dbFile, dbPath);
            await imRepos.switch(dbPath);
            await this.merge.importRepos(imRepos, this, overwrite);
            await this.merge.importWallet(
                this,
                remoteWalletPath,
                localWalletPath
            );
        } finally {
            await imRepos.close();
            await fsPromise.rm(importPath, { recursive: true });
        }
    }

    get dbLocation() {
        return this.db?.location;
    }
}

export { LevelDb };
