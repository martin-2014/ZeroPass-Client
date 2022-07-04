import logger from "electron-log";
import {
    remoteIpfsRequest,
    remotePinStat,
    remoteSpaceRootFolder,
    remoteStatus,
} from "./api/remoteIpfsRequest";
import { TExportItem, TItemProperty } from "./itemProperty";
const { STATUS } = require("./daemon/consts");
const { app } = require("electron");
const setupDaemon = require("./daemon");
const { addItemFromLocal, addItemFromIpfs } = require("./files/addItem");
const { removeItemByPath } = require("./files/removeItem");
const { isLocalPinned } = require("./files/localPin");
const exportItem = require("./files/exportItem");
const {
    getItemProperty,
    getBaseItemProperty,
    getRootItemProperty,
} = require("./files/itemProperty");
const { cloneRemoteSpace } = require("./files/initializeSpace");
const connect = require("./connect");
const { join } = require("path/posix");
const { toCID, cidIsEqual, makeDirectory } = require("./utility");
const { SpacePath } = require("./common/consts");
var fs = require("fs-extra");

export class TipfsInstance implements TipfsInstance {
    private ctx: any = null;
    private ipfs: any = null;
    private isSpaceValidate: boolean = false;

    private ipfsService: remoteIpfsRequest = null;

    public constructor(
        ipcRequesterSend: (
            method: Message.IpcMethod,
            data?: any
        ) => Promise<any> = undefined
    ) {
        this.ipfsService = new remoteIpfsRequest(ipcRequesterSend);
    }

    public onStatusUpdated(status: number) {
        //logger.debug("the ipfs daemon status:", status)
    }

    public async start(repoFullPath: string): Promise<boolean> {
        app.on("before-quit", async () => {
            if (this.ipfs) await this.stop();
        });

        const isRepoFolderExist = await makeDirectory(repoFullPath).catch(
            (err) => {
                logger.error(err);
                return false;
            }
        );
        if (isRepoFolderExist === false) {
            return false;
        }

        const remoteRoot = await this.ipfsService.getRemoteSpaceRootItem();
        if (remoteRoot === undefined) {
            logger.error(
                "get remote space information failed, maybe network issue"
            );
            return false;
        }

        this.ipfs = null;

        this.ctx = {};
        this.ctx.onDaemonStatus = this.onStatusUpdated;
        this.ctx.peers = remoteRoot.peers;
        setupDaemon(this.ctx, repoFullPath); // ctx.getIpfsd, startIpfs, stopIpfs, restartIpfs

        var ret = await this.ctx.startIpfs();
        if (ret === STATUS.STARTING_FINISHED) {
            const ipfsd = await this.ctx.getIpfsd();
            this.ipfs = ipfsd.api;
            this.isSpaceValidate = await this.isValidSpace().catch((err) => {
                return false;
            });
        }

        return ret === STATUS.STARTING_FINISHED;
    }

    public async stop(): Promise<boolean> {
        if (
            this.ipfs !== null &&
            this.ctx !== null &&
            this.ctx.stopIpfs !== undefined
        ) {
            const ret = await this.ctx.stopIpfs();
            if (ret === STATUS.STOPPING_FINISHED) {
                this.ctx = null;
                this.ipfs = null;
                this.isSpaceValidate = false;
            }

            return ret === STATUS.STOPPING_FINISHED;
        }

        return false;
    }

    private async reStart(peers: string[]): Promise<boolean> {
        if (
            this.ipfs !== null &&
            this.ctx !== null &&
            this.ctx.restartIpfs !== undefined
        ) {
            this.ctx.peers = peers;
            var ret = await this.ctx.restartIpfs();
            if (ret === STATUS.STARTING_FINISHED) {
                const ipfsd = await this.ctx.getIpfsd();
                this.ipfs = ipfsd.api;
                this.isSpaceValidate = await this.isValidSpace().catch(
                    (err) => {
                        return false;
                    }
                );
                return true;
            }
        }

        return false;
    }

    private async isValidSpace(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return false;
            }

            const rootItemProperty = await this.getRootItemProperty();
            const baseItemProperty = await this.getBaseItemProperty();

            if (
                rootItemProperty.existed === false ||
                baseItemProperty.existed === false
            ) {
                reject(new Error("the local space is invalidate"));
                return false;
            }

            resolve(true);
        });
    }

    public async isLocalChanged(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return false;
            }

            const rootItemProperty = await this.getRootItemProperty();
            const baseItemProperty = await this.getBaseItemProperty();

            if (
                rootItemProperty.existed === false ||
                baseItemProperty.existed === false
            ) {
                reject(new Error("the local space missed several core folder"));
                return false;
            }

            if (cidIsEqual(rootItemProperty.cid, baseItemProperty.cid)) {
                resolve(false);
                return false;
            } else {
                resolve(true);
                return true;
            }
        });
    }

    public async isRemoteChanged(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return false;
            }

            const remoteRoot = await this.ipfsService.getRemoteSpaceRootItem();
            if (remoteRoot === undefined) {
                reject(
                    new Error(
                        "get remote space information failed, maybe network issue"
                    )
                );
                return true;
            }

            if (remoteRoot.isEmptyFolder()) {
                resolve(false);
                return false;
            }

            const baseItemProperty = await this.getBaseItemProperty();
            if (baseItemProperty.existed === false) {
                reject(
                    new Error("the base folder is not found in local space")
                );
                return false;
            }

            if (cidIsEqual(baseItemProperty.cid, toCID(remoteRoot.cid))) {
                resolve(false);
                return false;
            } else {
                resolve(true);
                return true;
            }
        });
    }

    public async cloneSpace(
        deepClone: boolean,
        onProgress: (itemProperty: TItemProperty) => void = undefined
    ): Promise<TItemProperty> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return null;
            }

            const remoteSpaceRootItem =
                await this.ipfsService.getRemoteSpaceRootItem();
            if (remoteSpaceRootItem === undefined) {
                reject(
                    new Error(
                        "get remote space information failed, maybe network issue"
                    )
                );
                return null;
            }

            const inactiveConnect = await this.activeConnect(
                remoteSpaceRootItem.peers,
                "cloneSpace"
            );
            cloneRemoteSpace(
                this.ipfs,
                remoteSpaceRootItem.cid,
                deepClone,
                (itemProperty) => {
                    if (onProgress !== undefined) {
                        onProgress(itemProperty);
                    }
                }
            )
                .then((localSpaceRootFolder) => {
                    this.isSpaceValidate = true;
                    resolve(localSpaceRootFolder);
                    return localSpaceRootFolder;
                })
                .catch((err: any) => {
                    reject(err);
                    return null;
                })
                .finally(() => {
                    if (inactiveConnect !== undefined) {
                        inactiveConnect();
                    }
                });
        });
    }

    public async uploadSpace(
        onProgress: (uploadStat: remotePinStat) => void = undefined
    ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return false;
            }
            if (!this.isSpaceValidate) {
                reject(new Error("the local space does not initialize"));
                return false;
            }

            const localSpaceRootItem = await this.getRootItemProperty();
            if (!localSpaceRootItem.existed) {
                reject(new Error("the local space does not exists"));
                return false;
            }

            const isLocalChanged = await this.isLocalChanged().catch((err) => {
                reject(err);
                return false;
            });
            if (!isLocalChanged) {
                logger.warn(
                    "the local space does not changed, no need to upload"
                );
                resolve(true);
                return true;
            }

            const isRemoteChanged = await this.isRemoteChanged().catch(
                (err) => {
                    reject(err);
                    return true;
                }
            );

            if (isRemoteChanged) {
                reject(
                    new Error(
                        "the remote space changed, please merge these changes at the local before upload"
                    )
                );
                return false;
            }

            var inactiveConnect = undefined;
            await this.ipfsService
                .remotePin(
                    localSpaceRootItem.cid.toString(),
                    async (uploadStat: remotePinStat, peers: string[]) => {
                        if (onProgress !== undefined) {
                            onProgress(uploadStat);
                        }

                        if (uploadStat.status === remoteStatus.Retrieving) {
                            if (inactiveConnect === undefined) {
                                inactiveConnect = await this.activeConnect(
                                    peers,
                                    "upload Space"
                                );
                            }
                        }

                        if (uploadStat.isCompleted()) {
                            if (inactiveConnect !== undefined) {
                                logger.debug(
                                    `the remote server pin ${
                                        localSpaceRootItem.cid
                                    } job ${remoteStatus[uploadStat.status]}`
                                );
                                inactiveConnect();
                            }

                            if (uploadStat.status === remoteStatus.Succeed) {
                                const baseFolder = await addItemFromIpfs(
                                    this.ipfs,
                                    localSpaceRootItem.cid,
                                    SpacePath.Base,
                                    false
                                ).catch(async (err) => {
                                    reject(err);
                                    return false;
                                });

                                if (baseFolder === undefined) {
                                    reject(
                                        new Error(
                                            "update the local base folder failed after upload successful"
                                        )
                                    );
                                    return false;
                                }

                                resolve(true);
                                return true;
                            }
                            if (uploadStat.status === remoteStatus.Expired) {
                                reject(new Error("the remote pin expired."));
                                return false;
                            }
                            if (uploadStat.status === remoteStatus.Timeout) {
                                reject(
                                    new Error("the remote pin task expired.")
                                );
                                return false;
                            }
                        }
                    }
                )
                .catch((err) => {
                    reject(err);
                    return false;
                });
        });
    }

    public async addItem(
        localItem: string,
        relativePath: string = ""
    ): Promise<TItemProperty> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return null;
            }
            if (!this.isSpaceValidate) {
                reject(new Error("the local space does not initialize"));
                return false;
            }

            const targetPath = this.getAbsolutePath(relativePath);
            addItemFromLocal(this.ipfs, localItem, targetPath)
                .then((itemProperty) => {
                    resolve(itemProperty);
                    return itemProperty;
                })
                .catch((err) => {
                    reject(err);
                    return null;
                });
        });
    }

    public async removeItem(itemPath: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return false;
            }
            if (!this.isSpaceValidate) {
                reject(new Error("the local space does not initialize"));
                return false;
            }

            const absoluteItemPath = this.getAbsolutePath(itemPath);
            const itemProperty = await getItemProperty(
                this.ipfs,
                absoluteItemPath
            );
            if (!itemProperty.existed) {
                reject(
                    new Error(`the ${absoluteItemPath} item does not exists`)
                );
                return false;
            }

            const ret = await removeItemByPath(this.ipfs, absoluteItemPath);
            resolve(ret);
            return ret;
        });
    }

    public async exportToLocal(
        itemPath: string,
        localPath: string,
        onProgress: (itemProperty: TItemProperty) => void = undefined
    ): Promise<TExportItem> {
        return new Promise(async (resolve, reject) => {
            if (this.ipfs == null) {
                reject(new Error("the ipfs daemon does not started"));
                return null;
            }
            if (!this.isSpaceValidate) {
                reject(new Error("the local space does not initialize"));
                return false;
            }

            const absoluteItemPath = this.getAbsolutePath(itemPath);
            const itemProperty = await getItemProperty(
                this.ipfs,
                absoluteItemPath
            );
            if (!itemProperty.existed) {
                reject(
                    new Error(`the ${absoluteItemPath} item does not exists`)
                );
                return null;
            }
            var connectInterval = undefined;
            if (!isLocalPinned(itemProperty)) {
                const remoteSpaceRootItem =
                    await this.ipfsService.getRemoteSpaceRootItem();
                if (remoteSpaceRootItem === undefined) {
                    reject(
                        new Error(
                            "get remote space information failed, maybe network issue"
                        )
                    );
                    return null;
                }
                connectInterval = await this.activeConnect(
                    remoteSpaceRootItem.peers,
                    "export item"
                );
            }

            exportItem(
                this.ipfs,
                absoluteItemPath,
                localPath,
                (itemProperty) => {
                    if (onProgress !== undefined) {
                        onProgress(itemProperty);
                    }
                }
            )
                .then(async (exportItem: any) => {
                    var movedToTarget = true;
                    if (this.isSpaceRoot(absoluteItemPath)) {
                        const { join } = require("path");
                        var sourceTempPath = join(localPath, SpacePath.Root);
                        try {
                            await fs.copy(sourceTempPath, localPath);
                            await fs.remove(sourceTempPath);
                            exportItem = exportItem.map((file) => {
                                file.localPath = localPath;
                                return file;
                            });
                        } catch (err) {
                            reject(err);
                            movedToTarget = false;
                        }
                    }
                    if (movedToTarget) {
                        resolve(exportItem);
                        return exportItem;
                    } else {
                        return null;
                    }
                })
                .catch((err: any) => {
                    reject(err);
                    return null;
                })
                .finally(() => {
                    if (connectInterval !== undefined) {
                        connectInterval();
                    }
                });
        });
    }

    private async activeConnect(peers: string[], prefix = "") {
        if (this.ctx !== null) {
            if (!this.ctx.peers.includes(peers[0])) {
                logger.debug(
                    "the default peer and the connect peer is not same, restart ipfs with connect peer"
                );
                await this.reStart(peers);
            }
            return connect(this.ipfs, peers[0], prefix);
        }
        return undefined;
    }

    public async getRootItemProperty(
        recursive: boolean = false
    ): Promise<TItemProperty> {
        if (this.ipfs != null) {
            return await getRootItemProperty(this.ipfs, recursive);
        }
        return null;
    }

    public async getBaseItemProperty(
        recursive: boolean = false
    ): Promise<TItemProperty> {
        if (this.ipfs != null) {
            return await getBaseItemProperty(this.ipfs, recursive);
        }

        return null;
    }

    public async getItemProperty(
        itemPath: string,
        recursive: boolean = false
    ): Promise<TItemProperty> {
        if (this.ipfs != null) {
            const absoluteItemPath = this.getAbsolutePath(itemPath);
            return await getItemProperty(
                this.ipfs,
                absoluteItemPath,
                recursive
            );
        }

        return null;
    }

    public async getRemoteSpaceRootFolder(): Promise<remoteSpaceRootFolder> {
        return await this.ipfsService.getRemoteSpaceRootItem();
    }

    public async getWebUi(): Promise<string> {
        if (this.ipfs != null) {
            return `http://127.0.0.1:${this.ipfs.apiPort}/webui`;
        }
        return "";
    }

    private getAbsolutePath(relativePath: string): string {
        if (relativePath === undefined || relativePath === null) {
            relativePath = "";
        }

        return join(SpacePath.Root, relativePath);
    }

    private isSpaceRoot(path: string): boolean {
        if (path === undefined || path === null || path === "") {
            return false;
        }

        var rootPath0 = join(SpacePath.Root, "");
        var rootPath1 = join(SpacePath.Root, "/");

        if (path === rootPath0 || path === rootPath1) {
            return true;
        }

        return false;
    }
}
