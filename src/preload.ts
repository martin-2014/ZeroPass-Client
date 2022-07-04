import { ipcRenderer, contextBridge } from "electron";

let unMax;
let max;
let logoutEvent;
let updateAvailableEvent;
let updateNotAvailableEvent;
let updateErrorEvent;
let updateProgressEvent;
let updateDownloadedEvent;
let checkExtensionCallback;
let ipcRequest: (msg: Message.RequestMessage) => Promise<any>;

window.addEventListener("DOMContentLoaded", () => {
    contextBridge.exposeInMainWorld("electron", {
        closeWindow: (closeOption: Number) =>
            ipcRenderer.send("window-close", closeOption),
        minWindow: () => ipcRenderer.send("window-min", "min"),
        maxWindow: () => ipcRenderer.send("window-max", "max"),
        unmaxWindow: () => ipcRenderer.send("window-unmax", "unmax"),
        initUnmax: (callback) => {
            unMax = callback;
        },
        initMax: (callback) => {
            max = callback;
        },
        openApp: openBrowser,
        getClientInfo: getClientInfo,
        checkProxyAsync: checkProxyAsync,
        sendWebRequest: sendWebRequest,
        login: () => ipcRenderer.send("login", "login"),
        logout: () => ipcRenderer.send("logout", "logout"),
        initLogout: (callBack) => {
            logoutEvent = callBack;
        },
        getCurrentVersion: GetCurrentVersion,
        GetDeviceId: GetDeviceId,
        checkForUpdates: (
            availableCallBack,
            notAvailableCallBack,
            errorCallBack
        ) => {
            (updateAvailableEvent = availableCallBack),
                (updateNotAvailableEvent = notAvailableCallBack),
                (updateErrorEvent = errorCallBack);
            ipcRenderer.send("check-for-updates");
        },
        downloadUpdates: (progressCallBack, downloadedCallBack) => {
            updateProgressEvent = progressCallBack;
            updateDownloadedEvent = downloadedCallBack;
            ipcRenderer.send("download-updates");
        },
        sendAllAppList: (data: any) => {
            ipcRenderer.send("get-all-app-list", data);
        },
        extensionHeartbeat: (callback) => {
            checkExtensionCallback = callback;
        },
        sendLocale: (data: any) => {
            ipcRenderer.send("get-locale", data);
        },
        initIpcRequest: (callback) => {
            ipcRequest = callback;
        },
        sendUserProfile: (extensionsMessage: Message.ExtensionsMessage) => {
            ipcRenderer.send("extensions-userProfile", extensionsMessage);
        },
        installUpdates: () => {
            ipcRenderer.send("install-updates");
        },
        sendMessageToExtensions: (
            extensionsMessage: Message.ExtensionsMessage
        ) => {
            ipcRenderer.send("extensions-message", extensionsMessage);
        },
        openClientMachineApp: (data: Message.ClienMachineDetail) => {
            ipcRenderer.send("open-client-machine-app", data);
        },
        sendUserLogin: () => ipcRenderer.send("extensions-login", "login"),
        safeCache: {
            setItem: (key: string, value: string) =>
                ipcRenderer.sendSync("set-cache-item", key, value),
            getItem: (key: string) =>
                ipcRenderer.sendSync("get-cache-item", key),
            clear: () => ipcRenderer.send("clear-cache"),
        },
        detectQrCode: async () => {
            return await ipcRenderer.invoke("detectQrCode");
        },
        detectBrowserProfiles: (options: MetaMask.BrowserProfileDetectArgs) => {
            return ipcRenderer.invoke("detectBrowserProfiles", options);
        },
        createMetaMaskWalletBackup: (args: MetaMask.CreateBackupArgs) => {
            return ipcRenderer.invoke("createMetaMaskWalletBackup", args);
        },
        deleteMetaMaskWalletBackup: (args: MetaMask.DeleteBackupArgs) => {
            return ipcRenderer.invoke("deleteMetaMaskWalletBackup", args);
        },
        recoverMetaMaskWalletBackup: (args: MetaMask.RecoverBackupArgs) => {
            return ipcRenderer.invoke("recoverMetaMaskWalletBackup", args);
        },
        existsMetaMaskWalletBackup: (args: MetaMask.ExistsBackupArgs) => {
            return ipcRenderer.invoke("existsMetaMaskWalletBackup", args);
        },
        getMetaMaskWalletState: (args: MetaMask.BrowserProfile) => {
            return ipcRenderer.invoke("getMetaMaskWalletState", args);
        },
        getMetaMaskWalletAccountsFromDb: (
            args: MetaMask.GetWalletAccountsFromDbArgs
        ) => {
            return ipcRenderer.invoke("getMetaMaskWalletAccountsFromDb", args);
        },
        extractMetaMaskAccount: (args: MetaMask.ExtractWalletArgs) => {
            return ipcRenderer.invoke("extractMetaMaskAccount", args);
        },
    });
});

ipcRenderer.on("ipc-requester", async (_, msg) => {
    if (msg.method === "extensionHeartbeat") {
        if (checkExtensionCallback) checkExtensionCallback();
    } else {
        const ret = await ipcRequest(msg);
        ipcRenderer.send("ipc-requester", ret);
    }
});
ipcRenderer.on("window-unmaxed", () => {
    unMax();
});
ipcRenderer.on("window-maxed", () => {
    max();
});
ipcRenderer.on("logout", () => {
    if (logoutEvent) {
        logoutEvent();
    }
});

ipcRenderer.on("update-available", (event, version) => {
    if (updateAvailableEvent) {
        updateAvailableEvent(version);
    }
});
ipcRenderer.on("update-not-available", () => {
    if (updateNotAvailableEvent) {
        updateNotAvailableEvent();
    }
});
ipcRenderer.on("update-error", () => {
    if (updateErrorEvent) {
        updateErrorEvent();
    }
});
ipcRenderer.on("update-progress", (event, progress) => {
    if (updateProgressEvent) {
        updateProgressEvent(progress);
    }
});
ipcRenderer.on("update-downloaded", () => {
    if (updateDownloadedEvent) {
        updateDownloadedEvent();
    }
});

async function openBrowser(openDetail: Message.Detail) {
    const result = await ipcRenderer.invoke("open-app-entry", openDetail);
    return result;
}

async function checkProxyAsync(proxyModel) {
    var proxyJson = JSON.stringify(proxyModel);
    const result = await ipcRenderer.invoke("check-proxy-async", proxyJson);
    return result;
}

async function sendWebRequest(req: Message.WebRequestData) {
    const result = await ipcRenderer.invoke("web-request", req);
    return result;
}

function getClientInfo() {
    return ipcRenderer.sendSync("get-client-info");
}

function GetCurrentVersion() {
    return ipcRenderer.sendSync("get-current-version");
}

async function GetDeviceId() {
    return await ipcRenderer.sendSync("get-Device-ID");
}
