import { ipcMain } from "electron";
import { v4 as uuid } from "uuid";

const queue: { [id: string]: Message.RequestQueueItem } = {};

let rWebContents: Electron.WebContents;

const cleanOutDateRequest = () => {
    const now = new Date();
    for (let key in queue) {
        let item = queue[key];
        if (now.valueOf() - item.requestTime.valueOf() > 30000) {
            if (!item.message.data) {
                item.message.data = {};
            }
            item.message.data.errorId = "timeout";
            item.resolve(item.message.data);
            delete queue[key];
        }
    }
};

const ipcRequester = {
    send: function (method: Message.IpcMethod, data?: any): Promise<any> {
        const msg: Message.RequestMessage = {
            data: data,
            reqId: uuid(),
            method: method,
        };

        const promise = new Promise((resolve, reject) => {
            rWebContents.send("ipc-requester", msg);
            queue[msg.reqId] = {
                message: msg,
                resolve: resolve,
                reject: reject,
                requestTime: new Date(),
            };
        });
        promise.catch(() => {});
        return promise;
    },

    startUp: function (webContents: Electron.WebContents) {
        rWebContents = webContents;
        ipcMain.on("ipc-requester", (e, msg: Message.RequestMessage) => {
            if (msg.reqId in queue) {
                const item = queue[msg.reqId];
                delete queue[msg.reqId];
                item.resolve(msg.data);
            }
        });
        setInterval(cleanOutDateRequest, 1000);
    },
};

export default ipcRequester;
