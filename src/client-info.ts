import { app } from "electron";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import * as os from "os";

export default class ClientInfo {
    wssPort?: number;
    readonly userAppDataPath: string;
    readonly appName: string;
    readonly userTempPath: string;
    readonly clientOS: string;
    readonly clientVersion: string;
    readonly clientMachineCode: string;
    protected static instance: ClientInfo;
    protected constructor() {
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
        ClientInfo.instance = {
            appName: app.name,
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
    public static getInstance() {
        if (!ClientInfo.instance) {
            new ClientInfo();
        }
        return ClientInfo.instance;
    }
}
