/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates` callback from `updater` for the click property of `Check Updates...` MenuItem.
 */
import { dialog, ipcMain, BrowserWindow, app } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { version } from "uuid";
import updateUrl from "../render/src/.hub/node_config";

function update() {
    let quitNotification;
    let mainWindow;
    let startDownload = false;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.logger = log;
    const logger = autoUpdater.logger as any;

    log.info(`Update url:${updateUrl}`);
    autoUpdater.setFeedURL(updateUrl);

    autoUpdater.on("error", (error) => {
        var errorMessage =
            error == null ? "unknown" : (error.stack || error).toString();
        log.error(errorMessage);
        startDownload = false;
        mainWindow.webContents.send("update-error");
    });

    autoUpdater.on("update-available", (info) => {
        var version = info.version;
        log.log("Update available version:" + version);
        mainWindow.webContents.send("update-available", version);
    });

    autoUpdater.on("update-not-available", (info) => {
        log.log("Update not available");
        mainWindow.webContents.send("update-not-available");
    });

    autoUpdater.on("download-progress", (progress) => {
        log.log("download-progress");
        mainWindow.webContents.send("update-progress", progress);
    });

    autoUpdater.on("update-downloaded", () => {
        log.log("update-downloaded");
        startDownload = false;
        mainWindow.webContents.send("update-downloaded");
    });

    ipcMain.on("get-current-version", (event) => {
        var version = app.getVersion();
        log.log("Get current version:" + version);
        event.returnValue = version;
    });

    ipcMain.on("check-for-updates", () => {
        log.log("check for updates");
        autoUpdater.checkForUpdates();
    });

    ipcMain.on("download-updates", () => {
        log.log("download-updates");
        if (!startDownload) {
            startDownload = true;
            autoUpdater.downloadUpdate();
        }
    });
    ipcMain.on("install-updates", () => {
        log.log("install-updates");
        quitNotification();
        setImmediate(() => autoUpdater.quitAndInstall());
    });
    const Initialize = (quitCallback, browserWindow: BrowserWindow) => {
        quitNotification = quitCallback;
        mainWindow = browserWindow;
    };
    return { Initialize };
}

export default update;
