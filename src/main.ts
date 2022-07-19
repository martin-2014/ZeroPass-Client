import { app } from "electron";
import logger from "electron-log";
import ClientInfo from "./client-info";
import i18n from "./i18n";
//@ts-ignore
import { devTools } from "../render/src/.hub/dev_tools";
import updateUrl from "../render/src/.hub/node_config";
import createWindow from "./createWindow";
import getPluginRequestHandler from "./http/pluginRequestHandler";
import { storeItemList } from "./http/pluginRequestHandlerProxy";
import pluginStore from "./http/pluginStore";
import Sserver, { getFreePort } from "./http/sserver";
import initApp from "./initApp";
import { webRequestRouter } from "./logic";
import registerMainHandles from "./registerMainHandles";
import { configureLogger, getMainWindow, getOpenDevTools } from "./utils";
import path from "path";

const { NODE_ENV } = process.env;
const Open_DevTools = getOpenDevTools(devTools);
initApp(Open_DevTools, init);
function init() {
    const pluginRequestHandler = getPluginRequestHandler(pluginStore);
    const iconPath = path.join(__dirname, "../../icons/logo.ico");
    let sserver: Sserver = null;
    configureLogger(Open_DevTools, ClientInfo.getInstance());
    getFreePort((err: Error, freePort: number) => {
        logger.debug(`Starting ws server on port ${freePort} ...`);
        sserver = new Sserver(freePort, pluginStore, () => {
            ClientInfo.getInstance().wssPort = freePort;
        });

        sserver.addPostPluginHandles(pluginRequestHandler);
        registerMainHandles(
            i18n,
            webRequestRouter,
            sserver,
            pluginStore,
            ClientInfo.getInstance(),
            storeItemList,
            updateUrl,
            Open_DevTools,
            iconPath
        );
        pluginStore.windowFocusFn = () => {
            getMainWindow().setAlwaysOnTop(true);
            getMainWindow().show();
            getMainWindow().setAlwaysOnTop(false);
        };
    });
    app.whenReady().then(() => {
        createWindow(Open_DevTools);
        if (NODE_ENV === "deve") {
            // Dev mode on local
            getMainWindow().loadURL("http://localhost:8000");
        } else {
            getMainWindow().loadFile(
                path.join(__dirname, "../../render/dist/index.html")
            );
        }
    });
}
