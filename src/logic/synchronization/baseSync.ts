import { ISyncWorkFlow } from "./definition";
import {
    createPersonalLock,
    freePersonalLock,
    updatePersonalLock,
} from "./locks";
import path from "path";
import { app } from "electron";

export abstract class BaseSyncWorkflow implements ISyncWorkFlow {
    readonly DB_NAME = "db.7z";
    readonly WALLET_FOLDER = "mmbk";
    readonly TEMP_SYNC_DIR = path.join(app.getPath("temp"), "zeropass", "sync");
    readonly _method: string;

    constructor(method: string) {
        this._method = method;
    }

    abstract checkData(): Promise<boolean>;
    abstract downloadFile(): Promise<boolean>;
    abstract mergeData(): Promise<boolean>;
    abstract uploadFile(): Promise<boolean>;
    abstract startUp(): Promise<boolean>;
    abstract end(): Promise<boolean>;
    abstract get message(): string;
    abstract get type(): string;

    get method(): string {
        return this._method;
    }

    async getLock(): Promise<boolean> {
        return await createPersonalLock();
    }

    async freeLock(): Promise<boolean> {
        return await freePersonalLock();
    }

    async updateLock(): Promise<boolean> {
        return await updatePersonalLock();
    }

    async done(): Promise<boolean> {
        return true;
    }

    async error(): Promise<boolean> {
        return true;
    }

    async timeout(): Promise<boolean> {
        return true;
    }
}
