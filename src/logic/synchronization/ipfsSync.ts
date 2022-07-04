import { BaseSyncWorkflow } from "./baseSync";
import { ipfsServer } from ".";
import { cleanDir, createDirs, sevenZip, exists } from "../io";
import path from "path";
import { repos } from "../../repositories";
import * as fsPromise from "fs/promises";
import ipcRequester from "../../IpcRequester";
import logger from "electron-log";

const createIpfsDir = (id: number) => {
    return path.join(`${process.env.localappdata}/zeropass`, "ipfs", `${id}`);
};
class IpfsSyncWorkflow extends BaseSyncWorkflow {
    private tempSyncDbFile: string;
    private tempSyncWalletPath: string;
    private tempSyncDbPath: string;
    private deleteWalletFiles: string[] = [];
    private lastMessage: string = "";
    private syncType = "ipfs";

    constructor(method: string) {
        super(method);
        this.tempSyncDbFile = path.join(this.TEMP_SYNC_DIR, this.DB_NAME);
        this.tempSyncWalletPath = path.join(
            this.TEMP_SYNC_DIR,
            this.WALLET_FOLDER
        );
        this.tempSyncDbPath = path.join(this.TEMP_SYNC_DIR, "extract");
    }

    private toIpfsPath(localPath: string): string {
        const subPath = localPath
            .substring(this.TEMP_SYNC_DIR.length + 1)
            .replace("\\", "/");
        console.log(subPath);
        return `/${subPath}`;
    }

    get type(): string {
        return this.syncType;
    }

    get message(): string {
        return this.lastMessage;
    }

    async checkData(): Promise<boolean> {
        return true;
    }

    async downloadFile(): Promise<boolean> {
        if (!ipfsServer.isStarted) {
            return false;
        }
        await createDirs(this.TEMP_SYNC_DIR);
        await cleanDir(this.TEMP_SYNC_DIR);
        await ipfsServer.download(this.TEMP_SYNC_DIR);
        if (await exists(this.tempSyncDbFile)) {
            await sevenZip.extract(this.tempSyncDbFile, this.tempSyncDbPath);
        }
        if (!(await exists(this.tempSyncWalletPath))) {
            await createDirs(this.tempSyncWalletPath);
        }
        return true;
    }

    async mergeData(): Promise<boolean> {
        if (!ipfsServer.isStarted) {
            return false;
        }
        await repos.merge(this.tempSyncDbPath);
        const walletPath = path.join(
            path.dirname(repos.dbLocation),
            this.WALLET_FOLDER
        );
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
        await ipfsServer.addItem(this.tempSyncDbFile, "/");
        if (
            await ipfsServer.existed(this.toIpfsPath(this.tempSyncWalletPath))
        ) {
            await ipfsServer.removeItem(
                this.toIpfsPath(this.tempSyncWalletPath)
            );
        }
        await ipfsServer.addItem(this.tempSyncWalletPath, "/");

        await ipfsServer.upload();
        const cid = (await ipfsServer.getRootCid()).toString();
        this.lastMessage = `${cid}`;
        return true;
    }

    async startUp(): Promise<boolean> {
        const user = await ipcRequester.send("getUserInfo");
        if (user.fail) {
            logger.info("sync failed to get user info");
            return false;
        }
        const dir = createIpfsDir(user.payload.id);
        return await ipfsServer.startUp(dir);
    }

    async end(): Promise<boolean> {
        await ipfsServer.stop();
        return true;
    }
}

export { IpfsSyncWorkflow };
