import { TipfsInstance } from "../../ipfs";
import { IIpfsInstance } from "../../ipfs/ipfsInterface";
import path from "path";
import * as fsPromise from "fs/promises";
import logger from "electron-log";

interface IIpfsServer {
    addItem: (localPath: string, remotePath?: string) => Promise<void>;
    removeItem: (remotePath: string) => Promise<void>;
    startUp: (dir: string) => Promise<boolean>;
    stop: () => Promise<void>;
    isStarted: boolean;
    download: (localPath: string) => Promise<boolean>;
    upload: () => Promise<void>;
    repoPath: string;
    getRootCid: () => Promise<string>;
    existed: (remotePath: string) => Promise<boolean>;
}

class IpfsServer implements IIpfsServer {
    private _ipfs: IIpfsInstance;
    private _repoPath: string = "";
    private _isStarted: boolean = false;

    constructor() {}

    get isStarted(): boolean {
        return this._isStarted;
    }

    get repoPath(): string {
        return this._repoPath;
    }

    async addItem(localPath: string, remotePath?: string): Promise<void> {
        await this._ipfs.addItem(localPath, remotePath);
    }

    async removeItem(remotePath: string): Promise<void> {
        await this._ipfs.removeItem(remotePath);
    }

    async startUp(dir: string): Promise<boolean> {
        if (this._isStarted) {
            logger.error('ipfs already start')
            return true;
        }
        const ipfs = new TipfsInstance();
        this._isStarted = await ipfs.start(dir);
        logger.error('ipfs start: ', this._isStarted)
        if (this._isStarted) {
            this._repoPath = dir;
            this._ipfs = ipfs;
        }
        return this._isStarted;
    }

    async stop(): Promise<void> {
        if (this._isStarted && this._ipfs !== undefined) {
            await this._ipfs.stop();
            this._ipfs = undefined;
            this._isStarted = false;
            this._repoPath = "";
        }
    }

    async download(localPath: string): Promise<boolean> {
        const space = await this._ipfs.cloneSpace(true);
        if (space === undefined) {
            return false;
        }
        await this._ipfs.exportToLocal("/", localPath, (item) => {});
        // const rootDir = path.join(localPath, "root");
        // const files = await fsPromise.readdir(rootDir);
        // for (const file of files) {
        //     const filePath = path.join(rootDir, file);
        //     const dstPath = path.join(localPath, file);
        //     await fsPromise.cp(filePath, dstPath, { recursive: true });
        // }
        return true;
    }

    async upload(): Promise<void> {
        await this._ipfs.uploadSpace();
    }

    async getRootCid(): Promise<string> {
        const item = await this._ipfs.getRootItemProperty();
        return item.cid;
    }

    async existed(remotePath: string): Promise<boolean> {
        const item = await this._ipfs.getItemProperty(remotePath);
        return item?.existed;
    }
}

export { IIpfsServer, IpfsServer };
