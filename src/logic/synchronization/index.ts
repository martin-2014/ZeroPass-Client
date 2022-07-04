import { ISyncWorkFlow, SyncStatus, SyncErrorStatus } from "./definition";
import { ShareFolderSyncWorkflow } from "./shareFolderSync";
import logger from "electron-log";
import { repos } from "../../repositories";
import { IIpfsServer, IpfsServer } from "./ipfsServer";
import { promiseDelay } from "../../utils";

const syncErrorId: { [key in SyncErrorStatus]: string } = {
    error: "err_data_sync_error",
    start: "err_data_sync_start_error",
    getLock: "err_data_sync_lock_failed",
    downloadFile: "err_data_sync_download_failed",
    mergeData: "err_data_sync_merge_failed",
    uploadFile: "err_data_sync_upload_failed",
    timeout: "err_data_sync_timeout",
};

interface ISyncStatusMachine {
    run: (workflow: ISyncWorkFlow) => Promise<void>;
    isSyncing: boolean;
    status: SyncStatus;
    lastError: string;
    lastMessage: string;
    errorId: string | undefined;
    type: string;
    isStarted: boolean;
}

class SyncStatusMachine implements ISyncStatusMachine {
    private syncStatus: SyncStatus;
    private timeout: boolean = false;
    private isNext: boolean = true;
    private workflow: ISyncWorkFlow;
    private lockFail: boolean = false;
    private _lastError: string;
    private _lastMessage: string;
    private _isSyncing: boolean;
    private _errorId: string | undefined;

    constructor() {
        this.syncStatus = "normal";
    }

    get lastError() {
        return this._lastError;
    }

    get lastMessage(): string {
        return this._lastMessage;
    }

    get status() {
        return this.syncStatus;
    }

    get isSyncing() {
        return this._isSyncing;
    }

    get errorId() {
        return this._errorId;
    }

    get type() {
        return this.workflow?.type;
    }

    get isStarted() {
        return (
            this.syncStatus !== "normal" &&
            this.syncStatus !== "timeout" &&
            this.syncStatus !== "done" &&
            this.syncStatus !== "error"
        );
    }

    async run(workflow: ISyncWorkFlow): Promise<void> {
        const self = this;
        let startTime: Date;
        let interval: NodeJS.Timer;
        let updateLockTimer: NodeJS.Timer;
        logger.info("run sync start");
        if (this.isStarted) {
            logger.debug("sync have been started");
            return;
        }
        this.workflow = workflow;
        try {
            this.resetStatusBegin();
            startTime = new Date();

            this.syncStatus = "start";
            logger.info("sync start, set timeout interval");
            this.isNext = await this.workflow.startUp();
            if (!(await this.goNext())) {
                return;
            }

            interval = setInterval(async () => {
                self.timeout = Date.now() - startTime.getTime() > 600000;
            }, 1000);
            updateLockTimer = setInterval(async () => {
                const re = await self.workflow.updateLock();
                self.lockFail = !re;
            }, 60000);

            logger.debug("sync check data");
            this.syncStatus = "checkData";
            this.isNext = await workflow.checkData();
            if (!(await this.goNext())) {
                return;
            }

            logger.debug("sync get data lock");
            this.syncStatus = "getLock";
            this.isNext = await workflow.getLock();
            if (!(await this.goNext())) {
                return;
            }

            this._isSyncing = true;

            logger.debug("sync download files");
            this.syncStatus = "downloadFile";
            this.isNext = await workflow.downloadFile();
            if (!(await this.goNext())) {
                return;
            }

            logger.debug("sync data merge");
            this.syncStatus = "mergeData";
            this.isNext = await workflow.mergeData();
            if (!(await this.goNext())) {
                return;
            }

            logger.debug("sync upload files");
            this.syncStatus = "uploadFile";
            this.isNext = await workflow.uploadFile();
            if (!(await this.goNext())) {
                return;
            }

            this._lastMessage = workflow.message;
            await this.setDone();
        } catch (e) {
            logger.error(e);
            await this.setError(e);
        } finally {
            if (interval !== undefined) {
                logger.debug("sync clear timeout interval");
                clearInterval(interval);
            }
            if (updateLockTimer !== undefined) {
                logger.debug("sync clean update lock timer");
                clearInterval(updateLockTimer);
            }

            let syncStatus: Message.SyncStatus = "successfully";
            if (this.status === "error") {
                syncStatus = "failed";
            }
            if (this.status === "timeout") {
                syncStatus = "timeout";
            }
            const info: Message.SyncInfo = {
                type: this.workflow.type as Message.SyncType,
                method: this.workflow.method as Message.SyncMethod,
                status: syncStatus,
                endTime: Date.now(),
                startTime: startTime.getTime(),
                message: this.workflow.message,
            };
            await repos.appConfigs.setLastSyncStatus(info);

            await this.resetStatusEnd();
        }
    }

    private async freeLock() {
        logger.debug("sync free lock");
        this.syncStatus = "freeLock";
        this.isNext = await this.workflow.freeLock();
    }

    private async setDone(): Promise<void> {
        await this.freeLock();
        logger.debug("sync done");
        this.syncStatus = "done";
        await this.workflow.done();
    }

    private async setTimeout(): Promise<void> {
        await this.freeLock();
        logger.debug("sync timeout");
        this.syncStatus = "timeout";
        this._errorId = syncErrorId["timeout"];
        await this.workflow.timeout();
    }

    private async setLockFailed(): Promise<void> {
        await this.freeLock();
        logger.debug("sync lock failed");
        this.syncStatus = "error";
        this._errorId = syncErrorId["getLock"];
        await this.workflow.error();
    }

    private async setError(err?: { toString: () => string }): Promise<void> {
        this._errorId = syncErrorId[this.syncStatus];
        if (this.isSyncing) {
            await this.freeLock();
        }
        if (err instanceof Error) {
            this._lastError = (err as Error).message;
        } else {
            this._lastError = err?.toString() ?? "";
        }
        this.syncStatus = "error";
        await this.workflow.error();
    }

    private async resetStatusEnd() {
        logger.debug("sync reset status end");
        await this.workflow.end();
        this.isNext = true;
        this.timeout = false;
        this.workflow = undefined;
        this.lockFail = false;
        this._isSyncing = false;
    }

    private resetStatusBegin() {
        logger.debug("sync reset status begin");
        this._lastError = "";
        this._isSyncing = false;
        this._errorId = undefined;
        this._lastMessage = "";
    }

    private async goNext(): Promise<boolean> {
        if (!this.isNext) {
            await this.setError();
            return false;
        }
        if (this.timeout) {
            await this.setTimeout();
            return false;
        }
        if (this.lockFail) {
            await this.setLockFailed();
            return false;
        }
        return true;
    }
}

const syncStatusMachine = new SyncStatusMachine();
const ipfsServer: IIpfsServer = new IpfsServer();

export { syncStatusMachine, ShareFolderSyncWorkflow, ipfsServer };
