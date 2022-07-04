import path from "path";
import { cleanDir, copy, createDirs, exists, isDir, sevenZip } from "../io";
import { hash } from "../io";
import { repos } from "../../repositories";
import fsPromise from "fs/promises";
import { BaseSyncWorkflow } from "./baseSync";

class ShareFolderSyncWorkflow extends BaseSyncWorkflow {
    get type(): string {
        throw new Error("Method not implemented.");
    }
    get message(): string {
        return "";
    }
    async startUp(): Promise<boolean> {
        return true;
    }
    async end(): Promise<boolean> {
        return true;
    }
    private dbPath: string;
    private dbExisted: boolean;
    private tempSyncDbFile: string;
    private tempSyncDbPath: string;
    private mmbkPath: string;
    private tempSyncWalletPath: string;
    private deleteWalletFiles: string[] = [];

    constructor(sharePath: string) {
        super("shareFolder");
        this.dbPath = path.join(sharePath, this.DB_NAME);
        this.tempSyncDbFile = path.join(this.TEMP_SYNC_DIR, this.DB_NAME);
        this.tempSyncDbPath = path.join(this.TEMP_SYNC_DIR, "extract");
        this.tempSyncWalletPath = path.join(
            this.TEMP_SYNC_DIR,
            this.WALLET_FOLDER
        );
    }

    async checkData(): Promise<boolean> {
        this.dbExisted = await exists(this.dbPath);
        if (this.dbExisted) {
            const dig = await hash.sha2(this.dbPath);
            const s2 = await repos.appConfigs.getSyncDbFingerprint();
            if (dig === s2) {
                return false;
            }
        }
        return true;
    }

    async downloadFile(): Promise<boolean> {
        await createDirs(this.TEMP_SYNC_DIR);
        await cleanDir(this.TEMP_SYNC_DIR);
        if (this.dbExisted) {
            await copy(this.dbPath, this.tempSyncDbFile);
            await sevenZip.extract(this.tempSyncDbFile, this.tempSyncDbPath);
        }
        if ((await exists(this.mmbkPath)) && (await isDir(this.mmbkPath))) {
            await copy(this.mmbkPath, this.tempSyncWalletPath);
        } else {
            await createDirs(this.tempSyncWalletPath);
        }
        return true;
    }

    async mergeData(): Promise<boolean> {
        await repos.merge(this.tempSyncDbPath);
        const walletPath = path.join(path.dirname(repos.dbLocation), "mmbk");
        this.deleteWalletFiles = await repos.mergeWallet(
            walletPath,
            this.tempSyncWalletPath
        );
        return true;
    }

    async uploadFile(): Promise<boolean> {
        if (await exists(this.tempSyncDbFile)) {
            await fsPromise.rename(
                this.tempSyncDbFile,
                `${this.tempSyncDbFile}.old`
            );
        }
        await sevenZip.compress(
            `${this.tempSyncDbPath}/*`,
            this.tempSyncDbFile
        );
        await copy(this.tempSyncDbFile, this.dbPath);
        const s2 = await hash.sha2(this.tempSyncDbFile);
        await repos.appConfigs.setSyncDbFingerprint(s2);
        await copy(this.tempSyncWalletPath, this.mmbkPath);
        for (const file of this.deleteWalletFiles) {
            const filePath = path.join(this.mmbkPath, file);
            await fsPromise.rm(filePath);
        }
        return true;
    }
}

export { ShareFolderSyncWorkflow };
