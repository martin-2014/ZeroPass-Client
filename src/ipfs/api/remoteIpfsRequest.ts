import ipcRequester from "../../IpcRequester";
import logger from "electron-log";

export enum remoteStatus {
    Unknown = 0,
    Waiting = 1,
    Searching = 2,
    Retrieving = 3,
    Succeed = 4,
    Expired = 5,
    Timeout = 6,
}

export class remoteSpaceRootFolder {
    public cid: string;
    public peers: string[];
    public pinningCid: string;
    public pinningStatus: remoteStatus;

    public isPinning(): boolean {
        if (
            this.pinningCid !== undefined &&
            this.pinningCid !== null &&
            this.pinningCid !== ""
        ) {
            if (
                this.pinningStatus === remoteStatus.Searching ||
                this.pinningStatus === remoteStatus.Waiting ||
                this.pinningStatus === remoteStatus.Retrieving
            ) {
                return true;
            }
        }
        return false;
    }

    public isEmptyFolder(): boolean {
        return this.cid === "";
    }
}

export class remotePinStat {
    public cid: string;
    public status: remoteStatus;
    public size: number;
    public locatedSize: number;

    public isCompleted(): boolean {
        return (
            this.status === remoteStatus.Succeed ||
            this.status === remoteStatus.Expired ||
            this.status === remoteStatus.Timeout
        );
    }

    public isSuccessful(): boolean {
        return this.status === remoteStatus.Succeed;
    }
}

export class remotePinResult {
    public cid: string;
    public peers: string[];
}

export type onRemoteProgress = (
    itemProperty: remotePinStat,
    peers: string[]
) => void;

export class remoteIpfsRequest {
    private rootPath: string = "root";

    private ipcRequesterSend: (
        method: Message.IpcMethod,
        data?: any
    ) => Promise<any>;
    public constructor(
        ipcRequesterSend: (
            method: Message.IpcMethod,
            data?: any
        ) => Promise<any> = undefined
    ) {
        this.ipcRequesterSend = ipcRequesterSend;
        if (this.ipcRequesterSend === undefined) {
            this.ipcRequesterSend = ipcRequester.send;
        }
    }

    private async ipcRequest(req: Message.HttpRequest) {
        const apiResult = await this.ipcRequesterSend("restfulapiRequest", req);
        if (apiResult.errorId === "timeout") {
            logger.error("inter process communicate timeout, unknown reason");
            return undefined;
        }
        if (apiResult.fail === true) {
            logger.error(
                `invoke remote web api ${req.method} ${req.url} failed, the detail:`,
                apiResult.errorId
            );
            return undefined;
        }

        return apiResult.payload;
    }

    private async requestwebApi(
        method: Message.HttpMethod,
        relativeUrl: string,
        param: any = undefined
    ): Promise<any> {
        const req: Message.HttpRequest = {
            method: method,
            url: relativeUrl,
            param: param,
        };

        var nIndex = 0;
        var requestRet = undefined;
        for (var nIndex = 0; nIndex < 3; nIndex++) {
            requestRet = await this.ipcRequest(req);
            if (requestRet !== undefined) {
                break;
            }

            logger.debug(
                `try calling the api for ${nIndex + 2} time after 2 seconds`
            );
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 3000);
            });
        }

        return requestRet;
    }

    public async getRemoteSpaceRootItem(): Promise<remoteSpaceRootFolder> {
        const apiResult = await this.requestwebApi(
            "GET",
            `/api/pin/path/${this.rootPath}`
        );
        if (apiResult == undefined) {
            return undefined;
        }

        var peerId = apiResult.peerId;
        if (peerId === undefined || peerId === null || peerId === "") {
            logger.error("get root space failed, because peerid is empty");
            return undefined;
        }
        var remoteRootFolder = new remoteSpaceRootFolder();
        remoteRootFolder.cid = this.toEmptyString(apiResult.cid);
        remoteRootFolder.peers = [peerId];
        remoteRootFolder.pinningCid = this.toEmptyString(apiResult.latestCid);
        remoteRootFolder.pinningStatus = this.convertToEnum(
            apiResult.latestStatus
        );
        return remoteRootFolder;
    }

    public async getRemotePinStat(cid: string): Promise<remotePinStat> {
        //GET /api/pin/{cid}
        const apiResult = await this.requestwebApi("GET", `/api/pin/${cid}`);
        if (apiResult == undefined) {
            var pinStat = new remotePinStat();
            pinStat.cid = cid;
            pinStat.status = remoteStatus.Unknown;
            pinStat.size = 0;
            pinStat.locatedSize = 0;
            return pinStat;
        }

        var pinStat = new remotePinStat();
        pinStat.cid = cid;
        pinStat.status = this.convertToEnum(apiResult.status);
        pinStat.size = 0;
        pinStat.locatedSize = 0;
        return pinStat;
    }

    public async remotePin(
        cid: string,
        onProgress: onRemoteProgress
    ): Promise<remotePinResult> {
        const body = {
            cid: cid,
            relativePath: this.rootPath,
        };

        return new Promise(async (resolve, reject) => {
            const apiResult = await this.requestwebApi(
                "POST",
                `/api/pin`,
                body
            );
            if (apiResult == undefined) {
                reject("call remote pin api failed");
                return undefined;
            }
            var peerId = apiResult.peerId;
            if (peerId === undefined || peerId === null || peerId === "") {
                reject("remote pin failed, because peerid is empty");
                return undefined;
            }

            var result = new remotePinResult();
            result.cid = cid;
            result.peers = [peerId];

            this.emitProgress(result, onProgress);

            resolve(result);
        });
    }

    private async updateProgress(
        pinResult: remotePinResult,
        onProgress: onRemoteProgress
    ): Promise<remotePinStat> {
        const remotePinStat = await this.getRemotePinStat(pinResult.cid);
        onProgress(remotePinStat, pinResult.peers);

        return remotePinStat;
    }

    private async emitProgress(
        pinResult: remotePinResult,
        onProgress: onRemoteProgress
    ) {
        const remotePinStat = await this.updateProgress(pinResult, onProgress);
        if (!remotePinStat.isCompleted()) {
            const timeout = setTimeout(async () => {
                var timeoutRemotePinStat = await this.getRemotePinStat(
                    pinResult.cid
                );
                timeoutRemotePinStat.status = remoteStatus.Timeout;
                onProgress(timeoutRemotePinStat, pinResult.peers);
                logger.debug("the upload task timeout");
                clearInterval(interval);
            }, 900 * 1000);

            const interval = setInterval(async () => {
                const intervalRemotePinStat = await this.updateProgress(
                    pinResult,
                    onProgress
                );
                if (intervalRemotePinStat.isCompleted()) {
                    logger.debug("the upload progress completed");
                    clearInterval(interval);
                    clearTimeout(timeout);
                }
            }, 5000);
        }
        return remotePinStat;
    }

    private convertToEnum(status: string): remoteStatus {
        if (status === undefined || status === null || status === "") {
            return remoteStatus.Unknown;
        }
        status = status.trimStart().trimEnd();
        if (status === "Waiting") {
            return remoteStatus.Waiting;
        } else if (status === "Retrieving") {
            return remoteStatus.Retrieving;
        } else if (status === "Expired") {
            return remoteStatus.Expired;
        } else if (status === "Success") {
            return remoteStatus.Succeed;
        } else {
            return remoteStatus.Unknown;
        }
    }

    private toEmptyString(text: string | undefined | null) {
        if (text === undefined || text === null || text === "null") {
            return "";
        }
        return text;
    }
}
