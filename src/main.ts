import path from "path";
import {
    ipcMain,
    app,
    BrowserWindow,
    Tray,
    Menu,
    nativeImage,
    MenuItem,
} from "electron";
import openAppEntry from "./open-app-entry";
import checkProxy from "./check-proxy";
import ClientInfo from "./client-info";
import logger from "electron-log";
import update from "./update";
import i18n from "./i18n";
import settings from "./settings";
//@ts-ignore
import { devTools } from "../render/src/.hub/dev_tools";
import ipcRequester from "./IpcRequester";
import sserver, { getFreePort } from "./http/sserver";
import pluginStore from "./http/pluginStore";
import { storeItemList } from "#@/http/pluginRequestHandlerProxy";
import { webRequestRouter } from "./logic";
import SafeCache from "./safe-cache";
import detectQrCode from "./qrcode";
import dataWallet from "./logic/metaMaskWallet";
import { machineId } from "node-machine-id";
import { setMainWindow } from "./utils";

let tray;
let isQuiting;
let gIsLogin: boolean = false;
let mainWindow: BrowserWindow;
const quitMenu = () =>
    new MenuItem({
        label: i18n.t("tray.quit"),
        click: function () {
            isQuiting = true;
            app.quit();
        },
    });
const { NODE_ENV } = process.env;
if (NODE_ENV === "deve") {
    require("source-map-support").install();
}
const gotTheLock = app.requestSingleInstanceLock();

let Open_DevTools = true;
if (NODE_ENV != "deve") {
    Open_DevTools = devTools === "true";
}

function createBasicMenu() {
    var contextMenu = Menu.buildFromTemplate([quitMenu()]);
    tray.setContextMenu(contextMenu);
}

function CreateIconMenu(isLogin: boolean) {
    gIsLogin = isLogin;
    if (isLogin) {
        createLogoutMenu();
    } else {
        createLoginMenu();
    }
}

function createLoginMenu() {
    var contextMenu = Menu.buildFromTemplate([
        {
            label: i18n.t("tray.login"),
            click: function () {
                mainWindow.show();
            },
        },
        quitMenu(),
    ]);
    tray.setContextMenu(contextMenu);
}

function createLogoutMenu() {
    var contextMenu = Menu.buildFromTemplate([
        {
            label: i18n.t("tray.logout"),
            click: function () {
                mainWindow.webContents.send("logout");
            },
        },
        quitMenu(),
    ]);
    tray.setContextMenu(contextMenu);
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
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

    mainWindow.on("ready-to-show", async () => {
        const locale = await settings.getLocale();
        i18n.changeLanguage(locale);
        mainWindow.show();
        if (!Open_DevTools) {
            mainWindow.removeMenu();
        }
    });
    if (NODE_ENV === "deve") {
        // Dev mode on local
        mainWindow.loadURL("http://localhost:8000");
    } else {
        mainWindow.loadFile(
            path.join(__dirname, "../../render/dist/index.html")
        );
    }

    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("window-unmaxed");
    });
    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("window-maxed");
    });
    mainWindow.on("close", (event) => {
        if (!isQuiting) {
            event.preventDefault();
            mainWindow.hide();
            event.returnValue = false;
        }
    });

    ipcRequester.startUp(mainWindow.webContents);

    mainWindow.webContents.on("did-finish-load", () => {
        if (NODE_ENV === "deve") return;
        update().Initialize(() => {
            isQuiting = true;
        }, mainWindow);
    });
    ipcMain.handle("web-request", async (event, data) => {
        const result = await webRequestRouter(data);
        return result;
    });
    ipcMain.on(
        "extensions-message",
        async (_, arg: Message.ExtensionsMessage) => {
            sserver.broadcast(arg);
        }
    );
    ipcMain.on("window-close", (event, closeOption: Number) => {
        isQuiting = closeOption == 2;
        mainWindow.close();
    });
    ipcMain.on("window-max", () => {
        mainWindow.maximize();
        mainWindow.webContents.send("window-maxed");
    });
    ipcMain.on("window-min", () => {
        mainWindow.minimize();
    });
    ipcMain.on("window-unmax", () => {
        mainWindow.unmaximize();
        mainWindow.webContents.send("window-unmaxed");
    });
    ipcMain.on("get-locale", async (event, locale) => {
        i18n.changeLanguage(locale);
        await settings.setLocale(locale);
        CreateIconMenu(gIsLogin);
    });
    ipcMain.handle("open-app-entry", async (event, arg: Message.Detail) => {
        const { uri } = arg;
        if (arg.type != "goto") pluginStore.openDetail = arg;
        const res = await openAppEntry(uri, arg.browser);
        return res;
    });
    ipcMain.handle("check-proxy-async", async (event, arg) => {
        var checkResult = await checkProxy(arg);
        return checkResult;
    });
    ipcMain.on("get-client-info", (event) => {
        event.returnValue = ClientInfo.getInstance();
    });
    ipcMain.on("get-Device-ID", async (event) => {
        event.returnValue = await machineId();
    });
    ipcMain.on("get-cache-item", (event, item) => {
        event.returnValue = SafeCache.getItem(item);
    });
    ipcMain.on("set-cache-item", (event, item, value) => {
        event.returnValue = SafeCache.setItem(item, value);
    });
    ipcMain.on("clear-cache", (event, item) => {
        SafeCache.clear();
    });
    ipcMain.on("login", () => {
        CreateIconMenu(true);
    });
    ipcMain.on("get-all-app-list", (e, msg) => {
        const message = storeItemList(msg);
        sserver.broadcast(message);
    });
    ipcMain.on(
        "extensions-userProfile",
        (e, msg: Message.ExtensionsMessage) => {
            pluginStore.userProfileMessage = msg;
            sserver.broadcast(msg);
        }
    );
    ipcMain.on("extensions-login", (e, msg: Message.ExtensionsMessage) => {
        if (pluginStore.loginFormExtension) {
            pluginStore.loginFormExtension = false;
            mainWindow.hide();
        }
    });
    ipcMain.on(
        "open-client-machine-app",
        (e, data: Message.ClienMachineDetail) => {
            pluginStore.openClientMachineDetail.push(data);
        }
    );
    ipcMain.on("logout", () => {
        CreateIconMenu(false);
    });

    ipcMain.handle("detectQrCode", () => {
        return detectQrCode();
    });
    ipcMain.handle(
        "createMetaMaskWalletBackup",
        async (event, args: MetaMask.CreateBackupArgs) => {
            return await dataWallet.createBackup(args);
        }
    );
    ipcMain.handle(
        "deleteMetaMaskWalletBackup",
        async (event, args: MetaMask.DeleteBackupArgs) => {
            return await dataWallet.deleteBackup(args);
        }
    );
    ipcMain.handle(
        "recoverMetaMaskWalletBackup",
        async (event, args: MetaMask.RecoverBackupArgs) => {
            return await dataWallet.recoverBackup(args);
        }
    );
    ipcMain.handle(
        "detectBrowserProfiles",
        async (event, args: MetaMask.BrowserProfileDetectArgs) => {
            return await dataWallet.detectProfiles(args);
        }
    );
    ipcMain.handle(
        "existsMetaMaskWalletBackup",
        async (event, args: MetaMask.ExistsBackupArgs) => {
            return await dataWallet.existsBackup(args);
        }
    );
    ipcMain.handle(
        "getMetaMaskWalletState",
        async (event, args: MetaMask.BrowserProfile) => {
            return await dataWallet.getWalletState(args);
        }
    );
    ipcMain.handle(
        "getMetaMaskWalletAccountsFromDb",
        async (event, args: MetaMask.GetWalletAccountsFromDbArgs) => {
            return await dataWallet.getWalletsAccountFromDb(args);
        }
    );
    ipcMain.handle(
        "extractMetaMaskAccount",
        async (event, args: MetaMask.ExtractWalletArgs) => {
            return await dataWallet.extractAccount(args);
        }
    );
}

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            mainWindow.focus();
        }
    });

    configureLogger();
    getFreePort((err: Error, freePort: number) => {
        logger.debug(`Starting ws server on port ${freePort} ...`);

        sserver.startUp(freePort, () => {
            ClientInfo.getInstance().wssPort = freePort;
        });

        pluginStore.windowFocusFn = () => {
            mainWindow.setAlwaysOnTop(true);
            mainWindow.show();
            mainWindow.setAlwaysOnTop(false);
        };
    });
    app.whenReady().then(() => {
        createWindow();
        const icon = nativeImage.createFromPath(
            path.join(__dirname, "../../icons/logo.ico")
        );
        if (!icon.isEmpty()) {
            tray = new Tray(icon);
            tray.on("double-click", () => {
                mainWindow.show();
            });
            tray.setToolTip("ZeroPass");
            createBasicMenu();
        }

        app.on("activate", function () {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });
}

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

function configureLogger() {
    let filename = `electron.log`;
    logger.transports.file.resolvePath = () =>
        path.join(ClientInfo.getInstance().userAppDataPath, "logs", filename);
    logger.transports.file.level = Open_DevTools ? "debug" : "info";
    logger.transports.file.maxSize = 16 * 1024 * 1024;
    logger.transports.console.level = Open_DevTools ? "debug" : false;
}
