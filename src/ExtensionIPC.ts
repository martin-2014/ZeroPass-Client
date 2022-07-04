import net from "net";
import { EventEmitter } from "events";
import logger from "electron-log";

const BrowserExtensionPipeName: string =
    "BES-3702D6BC-E18A-4CC8-A64A-A5E078E6AC77";
export type ServiceStartResult = (success: boolean, msg: string) => void;
export default class ExtensionIpc extends EventEmitter {
    private static instance: ExtensionIpc;
    private wsPort: number = undefined;
    private ipcServer: net.Server = undefined;
    private clients: Map<net.Socket, ClientInfo> = new Map<
        net.Socket,
        ClientInfo
    >();
    constructor() {
        super();
    }

    public static getInstance(): ExtensionIpc {
        if (!ExtensionIpc.instance) {
            ExtensionIpc.instance = new ExtensionIpc();
        }
        return ExtensionIpc.instance;
    }
    public startIpcServer(wsPort: number) {
        this.wsPort = wsPort;
        logger.log("start ipc server...");
        this.ipcServer = net.createServer(this.connectionListenner.bind(this));
        this.ipcServer.on(
            "close",
            function () {
                logger.warn("ipc server: on close");
                this.emit("close");
            }.bind(this)
        );

        this.ipcServer.on("error", (err: Error) => {
            logger.warn(`ipc server on error: ${err.message}`);
            ExtensionIpc.instance.emit("listen", false);
        });

        const PIPE_PATH = "\\\\.\\pipe\\" + BrowserExtensionPipeName;
        this.ipcServer.listen(
            PIPE_PATH,
            function () {
                logger.info("ipc server is ready.");
                this.emit("listen", true);
            }.bind(this)
        );
    }

    private connectionListenner(client: net.Socket) {
        logger.debug("new ipc client connection.");
        this.clients.set(client, new ClientInfo());
        client.on("data", (data: Buffer) => {
            this.processIpcClientData.call(this, client, data);
        });

        client.on("end", function () {
            logger.debug("ipc client: on end");
        });
        client.on(
            "close",
            function (hadError: boolean) {
                logger.debug("ipc client on close with error ", hadError);
                this.clients.delete(client);
            }.bind(this)
        );

        //http://nodejs.cn/api/net.html#socketwritedata-encoding-callback
        client.on("drain", function () {
            console.log("Server - stream: on drain: cache is empty now");
        });
    }

    private processIpcClientData(client: net.Socket, data: Buffer): void {
        logger.debug("receive client data:", data.length);
        let clientInfo = this.clients.get(client);
        let dataStr =
            clientInfo.Data.length == 0
                ? data.toString()
                : clientInfo.Data.concat(data.toString());
        let msgs = dataStr.split("\0");
        clientInfo.Data = msgs[msgs.length - 1];
        if (msgs.length > 1) {
            let buffBase64 = Buffer.from(msgs[0], "base64");
            let json = buffBase64.toString();
            logger.debug("receive complete message:", json);
            try {
                let req = JSON.parse(json);
                if (req.action == "get-wss") {
                    logger.debug("invalid action:", req.action);
                    client.end(this.wsPort.toString());
                } else {
                    client.end();
                }
            } catch (e) {
                logger.warn("Islegal request", json);
                client.end();
            }
        } else {
            logger.info(
                "receive client message no end:",
                msgs[msgs.length - 1]
            );
        }
    }
}

class ClientInfo {
    public ConnectTime: Date = new Date();
    public Data: string = "";
}
