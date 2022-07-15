import { app, BrowserWindow } from "electron";
import createWindow from "./createWindow";
import { getMainWindow } from "./utils";

function initApp(Open_DevTools: boolean, cb: () => void) {
    const { NODE_ENV } = process.env;
    if (NODE_ENV === "deve") {
        require("source-map-support").install();
    }
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        cb();
    }
    app.on("window-all-closed", function () {
        if (process.platform !== "darwin") app.quit();
    });
    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(Open_DevTools);
        }
    });
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            mainWindow.focus();
        }
    });
}

export default initApp;
