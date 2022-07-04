import { remotePinStat, remoteSpaceRootFolder } from "./api/remoteIpfsRequest";
import { TExportItem, TItemProperty } from "./itemProperty";

export interface IIpfsInstance {
    onStatusUpdated(status: number): void;

    start(repoFullPath: string): Promise<boolean>;

    stop(): Promise<boolean>;

    isLocalChanged(): Promise<boolean>;

    isRemoteChanged(): Promise<boolean>;

    cloneSpace(
        deepClone?: boolean,
        onProgress?: (itemProperty: TItemProperty) => void
    ): Promise<TItemProperty>;

    uploadSpace(
        onProgress?: (uploadStat: remotePinStat) => void
    ): Promise<boolean>;

    addItem(localItem: string, targetPath?: string): Promise<TItemProperty>;

    removeItem(itemPath: string): Promise<boolean>;

    exportToLocal(
        itemPath: string,
        localPath: string,
        onProgress: (itemProperty: TItemProperty) => void
    ): Promise<TExportItem>;

    getRootItemProperty(recursive?: boolean): Promise<TItemProperty>;

    getBaseItemProperty(recursive?: boolean): Promise<TItemProperty>;

    getItemProperty(
        itemPath: string,
        recursive?: boolean
    ): Promise<TItemProperty>;

    getRemoteSpaceRootFolder(): Promise<remoteSpaceRootFolder>;

    getWebUi(): Promise<string>;
}
