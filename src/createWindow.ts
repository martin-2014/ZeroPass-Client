import { BrowserWindow } from "electron";
import { setMainWindow } from "./utils";
import path from "path";

function createWindow(Open_DevTools: boolean) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1152,
        height: 720,
        minWidth: 1152,
        minHeight: 720,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            devTools: Open_DevTools,
        },
    });
    setMainWindow(mainWindow);
}

export default createWindow;
