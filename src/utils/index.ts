import { BrowserWindow } from "electron";

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

export const setMainWindow = (win: BrowserWindow) => {
    mainWindow = win;
};

export const getMainWindow = () => {
    return mainWindow;
};
