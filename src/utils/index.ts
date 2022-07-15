import { BrowserWindow, Tray } from "electron";
//@ts-ignore
import logger from "electron-log";
import ClientInfo from "../client-info";
import path from "path";

const { NODE_ENV } = process.env;

export const promiseDelay = (ms: number): Promise<void> => {
    return new Promise<void>((resolve, _) => {
        setTimeout(resolve, ms);
    });
};

export const dateToYYYYMMDDHHMMSS = (date: Date) => {
    const ds: string =
        "" +
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
    return ds;
};

let mainWindow: BrowserWindow;
let isQuiting: boolean;
let tray: Tray;

export const setMainWindow = (win: BrowserWindow) => {
    mainWindow = win;
};

export const getMainWindow = () => {
    return mainWindow;
};

export const getOpenDevTools = (devTools: string) => {
    return NODE_ENV != "deve" ? devTools === "true" : true;
};

export const getIsQuiting = () => isQuiting;

export const setIsQuiting = (value: boolean) => {
    isQuiting = value;
};

export const setTray = (value: Tray) => {
    tray = value;
};

export const getTray = () => tray;

export function configureLogger(
    Open_DevTools: boolean,
    clientInfo: ClientInfo
) {
    let filename = `electron.log`;
    logger.transports.file.resolvePath = () =>
        path.join(clientInfo.userAppDataPath, "logs", filename);
    logger.transports.file.level = Open_DevTools ? "debug" : "info";
    logger.transports.file.maxSize = 16 * 1024 * 1024;
    logger.transports.console.level = Open_DevTools ? "debug" : false;
}
