type MsgType =
    | "GetListFromExtension"
    | "GetFillPasswordFromExtension"
    | "ReturnListFromApp"
    | "ReturnFillPasswordFromApp"
    | "ReturnWorkListFromWeb"
    | "ReturnPersonalListFromWeb"
    | "DecryptFromExtension"
    | "DecryptAndNotSendPasswordFromExtension"
    | "ReturnUserProfileFromApp"
    | "GetUserProfileFromExtension"
    | "ReturnSavePasswordFromApp"
    | "DecryptAndReturnPasswordFromExtension"
    | "LogoutFromExtension"
    | "LoginFromExtension"
    | "GetFillPasswordFromZINIAOExtension"
    | "ReturnFillPasswordFromZINIAOExtension"
    | "GetPasswordCheckingFromExtension"
    | "ReturnPasswordCheckingFromExtension"
    | "SavePasswordFromExtension"
    | "ReturnSavePasswordFromExtension"
    | "DecryptTextFromExtension"
    | "GetPasswordHistoryAll"
    | "PostPasswordHistory"
    | "DeletePasswordHistory"
    | "DeletePasswordHistoryAll"
    | "ExtensionHeartbeat";

type CredCheckStatus = "new" | "existed" | "update";

declare const electron: {
    sendMessageToExtensions: (
        extensionsMessage: Message.ExtensionsMessage
    ) => void;
    initDecrypt: (
        decrypt: (
            msg: Message.ExtensionsMessage
        ) => Promise<Message.ExtensionsMessage>
    ) => void;
    sendUserProfile: (extensionsMessage: Message.ExtensionsMessage) => void;
    sendAllAppList: (data: any) => void;
    sendLocale: (data: any) => void;
    openClientMachineApp: (data: Message.ClienMachineDetail) => void;
    sendUserLogin: () => void;
    initIpcRequest: (
        ipcRequest: (msg: Message.RequestMessage) => Promise<any>
    ) => void;
    sendWebRequest: (
        req: Message.WebRequestData
    ) => Promise<Message.WebResponseData>;
    safeCache: SafeCache.ISafeCache;
    initQrCodeEvent: (callback: any) => void;
    detectQrCode: () => Promise<string | null>;
    detectBrowserProfiles: (
        options: MetaMask.BrowserProfileDetectArgs
    ) => Promise<MetaMask.BrowserProfile[]>;
    createMetaMaskWalletBackup: (
        args: MetaMask.CreateBackupArgs
    ) => Promise<string>;
    deleteMetaMaskWalletBackup: (
        args: MetaMask.DeleteBackupArgs
    ) => Promise<boolean>;
    recoverMetaMaskWalletBackup: (
        args: MetaMask.RecoverBackupArgs
    ) => Promise<boolean>;
    existsMetaMaskWalletBackup: (
        args: MetaMask.ExistsBackupArgs
    ) => Promise<boolean>;
    getMetaMaskWalletState: (
        args: MetaMask.BrowserProfile
    ) => Promise<MetaMask.WalletState>;
    getMetaMaskWalletAccountsFromDb: (
        args: MetaMask.GetWalletAccountsFromDbArgs
    ) => Promise<MetaMask.WalletAccount[]>;
    extractMetaMaskAccount: (
        args: MetaMask.ExtractWalletArgs
    ) => Promise<Object>;
};

declare namespace SafeCache {
    interface ISafeCache {
        setItem(key: string, value: string);
        getItem(key: string): string;
        clear();
    }
}

declare namespace Message {
    type BrowserType = "default" | "chrome" | "edge" | "firefox";

    interface Detail {
        account: string;
        password: string;
        uri: string;
        domainId: number;
        type?: openDefaultBrowserType;
        browser?: BrowserType;
    }
    interface ClienMachineDetail {
        account: string;
        password: string;
        uri: string;
        domainId: number;
        containerid: string;
    }
    interface ExtensionsMessage {
        type: MsgType;
        message?: any;
        errorId?: string;
        name?: string;
    }

    interface RequestMessage {
        reqId: string;
        data: any;
        method: IpcMethod;
    }

    interface RequestQueueItem {
        message: RequestMessage;
        resolve: (result: any) => void;
        reject: (err: any) => void;
        requestTime: Date;
    }

    interface DecryptItem {
        text: string;
        domainId: number;
    }

    type LockAction = "create" | "free" | "update";

    interface LockRequest {
        action: LockAction;
        data: { deviceId: string };
    }

    type HttpMethod = "POST" | "GET" | "PUT";

    interface HttpRequest {
        method: HttpMethod;
        url: string;
        param: any;
    }

    type openDefaultBrowserType = "login" | "fill" | "goto";

    type IpcMethod =
        | "decrypt"
        | "toLogin"
        | "logout"
        | "getList"
        | "savePassword"
        | "getPasswordHistoryAll"
        | "postPasswordHistory"
        | "deletePasswordHistory"
        | "deletePasswordHistoryAll"
        | "lockOperation"
        | "restfulapiRequest"
        | "extensionHeartbeat"
        | "getUserInfo";

    type WebRquestMethod =
        | "getAllVaultItems"
        | "getVaultItems"
        | "createVaultItem"
        | "importVaultItem"
        | "updateVaultItem"
        | "patchVaultItem"
        | "deleteVaultItem"
        | "getVaultItemTags"
        | "favoriteVaultItem"
        | "unfavoriteVaultItem"
        | "getFavoriteVaultItem"
        | "getVaultItemsByTag"
        | "getVaultItemsById"
        | "login"
        | "logout"
        | "addPwdHistory"
        | "deletePwdHistory"
        | "deleteAllPwdHistories"
        | "getPwdHistories"
        | "exportData"
        | "mergeData"
        | "getMergeStatus"
        | "importData";

    type MergeDataErrorType = "error" | "timeout";

    interface WebRequestData {
        method: WebRquestMethod;
        params?: { [key: string]: any };
    }
    interface WebResponseData {
        payload?: any;
        errId?: any;
        fail: boolean;
    }

    interface VaultItem<T = any> {
        id?: number;
        name: string;
        description?: string;
        type: number;
        detail: T;
        domainId?: number;
        alias?: string;
        star?: boolean;
        tags?: string[];
    }

    interface VaultItemLogin {
        clientMachineId: number;
        loginPassword: string;
        loginUri: string;
        loginUser: string;
        note?: string;
    }

    type SyncType = "ipfs" | "google";

    type SyncMethod = "manual" | "schedule";

    type SyncStatus = "failed" | "successfully" | "timeout";

    interface SyncParams {
        type: SyncType;
        id: number;
        method: SyncMethod;
    }

    interface SyncInfo {
        type: SyncType;
        method: SyncMethod;
        status: SyncStatus;
        endTime: number;
        startTime: number;
        message: string;
    }

    interface SyncInfoData {
        lastSyncInfo: SyncInfo;
        type: SyncType;
        status: string;
        lastError: string;
        lastMessage: string;
        errorId: string;
    }

    interface ExportParams {
        userId: number;
        domainId: number;
    }

    interface ImportParams {
        userId: number;
        domainId: number;
        overwrite: boolean;
    }
}

declare namespace MetaMask {
    type WalletState = "nonexistent" | "unwritable" | "writable";
    type BrowserType = "Chrome" | "Brave" | "Edge";
    type ExtensionType = "Chrome" | "Edge";
    type Network = "bsc" | "etherenum" | "ropsten";

    type NetworkChain = {
        id: "0x3" | "0x38" | "0x1"; // https://chainlist.org/
        network: MetaMask.Network;
    };

    interface Token {
        network: MetaMask.Network;
        addresses: string[];
    }

    interface WalletAccount {
        name: string;
        address: string;
        tokens: Token[];
    }

    interface BrowserProfile {
        browser: BrowserType;
        name: string;
        displayName: string;
        extension: ExtensionType;
    }

    interface BrowserProfileDetectArgs {
        mode: "backup" | "recover";
    }

    interface CreateBackupArgs {
        profile: MetaMask.BrowserProfile;
        extension?: MetaMask.ExtensionType;
        userId: number;
        backupName: string;
    }
    interface DeleteBackupArgs {
        userId: number;
        backupName: string;
    }

    interface RecoverBackupArgs {
        userId: number;
        profile: MetaMask.BrowserProfile;
        backupName: string;
    }

    interface ExistsBackupArgs {
        userId: number;
        backupName: string;
    }

    interface GetWalletAccountsFromDbArgs {
        userId: number;
        backupName: string;
        networkChain: NetworkChain[];
    }

    interface ExtractWalletArgs {
        userId: number;
        backupName: string;
        properties?: string[];
    }
}
