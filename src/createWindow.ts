import { BrowserWindow } from "electron";
import { setMainWindow } from "./utils";

function createWindow(Open_DevTools: boolean, preloadPath: string) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1152,
        height: 720,
        minWidth: 1152,
        minHeight: 720,
        show: false,
        frame: false,
        webPreferences: {
            preload: preloadPath,
            nodeIntegration: true,
            devTools: Open_DevTools,
        },
    });
    setMainWindow(mainWindow);
}

export default createWindow;
