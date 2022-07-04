import { app } from "electron";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import * as os from "os";

const { NODE_ENV } = process.env;
export default class ClientInfo {
    private static instance: Utils.IClientInfo;
    private constructor() {}
    public static getInstance(): Utils.IClientInfo {
        if (!ClientInfo.instance) {
            let osType: string = undefined;
            switch (process.platform) {
                case "darwin":
                    osType = "mac";
                    break;
                case "win32":
                    osType = "windows";
                    break;
                default:
                    osType = "none";
            }

            const appPath =
                NODE_ENV === "deve"
                    ? process.cwd()
                    : path.dirname(app.getPath("exe"));
            ClientInfo.instance = {
                appName: app.name,
                embeddedBrowserPath: path.join(
                    appPath,
                    "resources",
                    "EmbeddedBrowser"
                ),
                userAppDataPath: path.join(
                    os.homedir(),
                    "AppData",
                    "Roaming",
                    app.name
                ),
                userTempPath: os.tmpdir(),
                clientOS: osType,
                clientVersion: app.getVersion(),
                clientMachineCode: (function () {
                    const interfaces = os.networkInterfaces();
                    for (let iface in interfaces) {
                        for (let i in interfaces[iface]) {
                            const f = interfaces[iface][i];
                            if (!f.internal) {
                                return f.mac;
                            }
                        }
                    }
                    return uuidv4();
                })(),
            };
        }
        return ClientInfo.instance;
    }
}
