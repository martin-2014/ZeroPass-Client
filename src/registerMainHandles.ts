import { app, ipcMain, Menu, MenuItem, nativeImage, Tray } from "electron";
import { i18n } from "i18next";
import path from "path";
import ipcRequester from "./IpcRequester";
import settings from "./settings";
import update from "./update";
import {
    getIsQuiting,
    getMainWindow,
    getTray,
    setIsQuiting,
    setTray,
} from "./utils";
//@ts-ignore
import { machineId } from "node-machine-id";
import ClientInfo from "./client-info";
import { StoreItemList } from "./http/pluginRequestHandlerProxy";
import { IPluginStore } from "./http/pluginStore";
import Sserver from "./http/sserver";
import { WebRequestRouter } from "./logic";
import dataWallet from "./logic/metaMaskWallet";
import openAppEntry from "./open-app-entry";
import detectQrCode from "./qrcode";
import SafeCache from "./safe-cache";

const { NODE_ENV } = process.env;
let gIsLogin: boolean = false;

function registerMainHandles(
    i18n: i18n,
    webRequestRouter: WebRequestRouter,
    sserver: Sserver,
    pluginStore: IPluginStore,
    clientInfo: ClientInfo,
    storeItemList: StoreItemList,
    updateUrl: string,
    Open_DevTools: boolean,
    iconPath: string
) {
    const mainWindow = getMainWindow();
    mainWindow.on("ready-to-show", async () => {
        const locale = await settings.getLocale();
        i18n.changeLanguage(locale);
        mainWindow.show();
        if (!Open_DevTools) {
            mainWindow.removeMenu();
        }
    });
    const quitMenu = () =>
        new MenuItem({
            label: i18n.t("tray.quit"),
            click: function () {
                setIsQuiting(true);
                app.quit();
            },
        });
    function CreateIconMenu(isLogin: boolean) {
        gIsLogin = isLogin;
        if (isLogin) {
            createLogoutMenu();
        } else {
            createLoginMenu();
        }
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
        getTray().setContextMenu(contextMenu);
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
        getTray().setContextMenu(contextMenu);
    }

    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("window-unmaxed");
    });
    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("window-maxed");
    });
    mainWindow.on("close", (event) => {
        if (!getIsQuiting()) {
            event.preventDefault();
            mainWindow.hide();
            event.returnValue = false;
        }
    });

    ipcRequester.startUp(mainWindow.webContents);

    mainWindow.webContents.on("did-finish-load", () => {
        if (NODE_ENV === "deve") return;
        update(updateUrl).Initialize(() => {
            setIsQuiting(true);
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
        setIsQuiting(closeOption == 2);
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
    ipcMain.on("get-client-info", (event) => {
        event.returnValue = clientInfo;
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
    function createBasicMenu() {
        var contextMenu = Menu.buildFromTemplate([quitMenu()]);
        getTray().setContextMenu(contextMenu);
    }
    const icon = nativeImage.createFromPath(iconPath);
    if (!icon.isEmpty()) {
        setTray(new Tray(icon));
        getTray().on("double-click", () => {
            mainWindow.show();
        });
        getTray().setToolTip("ZeroPass");
        createBasicMenu();
    }
}

export default registerMainHandles;
