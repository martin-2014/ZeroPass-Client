import { RequestHandler } from "express";
import ipcRequester from "../IpcRequester";
import pluginStore from "./pluginStore";
import { getAllItems } from "./pluginRequestHandlerProxy";

export enum VaultItemType {
    Login = 0,
    SecureNodes = 1,
    CreditCard = 2,
    PersonalInfo = 3,
}

interface IMatchLogin {
    uri: string;
    username: string;
}

const getUrlHost = (url: string) => {
    let result = "";
    try {
        const obj = new URL(url);
        result = obj.host;
    } catch {
        result = url.split("://")[0].split("/")[0];
    }
    return result;
};

const matchLogin = (old: IMatchLogin, nnew: IMatchLogin) => {
    return (
        getUrlHost(old.uri) === getUrlHost(nnew.uri) &&
        old.username.toLowerCase() === nnew.username.toLowerCase()
    );
};

const returnFillPasswordFromApp = () => {
    if (!pluginStore.openDetail) {
        const message: Message.ExtensionsMessage = {
            type: "ReturnFillPasswordFromApp",
            errorId: "-1",
        };
        return message;
    } else {
        const message: Message.ExtensionsMessage = {
            type: "ReturnFillPasswordFromApp",
            message: pluginStore.openDetail,
            errorId: "0",
        };
        pluginStore.openDetail = null;
        return message;
    }
};

const returnDecryptFillPasswordFromApp = async (
    msg: Message.ExtensionsMessage
) => {
    const req: Message.DecryptItem = {
        domainId: msg.message.domainId,
        text: msg.message.password,
    };
    const ret = await ipcRequester.send("decrypt", req);
    msg.message.password = ret.text;
    const message: Message.ExtensionsMessage = {
        type: "ReturnFillPasswordFromApp",
        message: msg.message,
        errorId: "0",
    };
    return message;
};

const decryptAndStoreCredential = async (msg: Message.ExtensionsMessage) => {
    const req: Message.DecryptItem = {
        domainId: msg.message.domainId,
        text: msg.message.password,
    };
    const ret = await ipcRequester.send("decrypt", req);
    msg.message.password = ret.text;
    pluginStore.openDetail = msg.message;
};

const decryptTextFromExtension = async (msg: Message.ExtensionsMessage) => {
    const req = msg.message;
    const ret = await ipcRequester.send("decrypt", req);
    req.text = ret.text;
    const message: Message.ExtensionsMessage = {
        type: msg.type,
        message: req,
        errorId: "0",
    };
    return message;
};

const returnGetPasswordFromApp = async (msg: Message.ExtensionsMessage) => {
    const req: Message.DecryptItem = {
        domainId: msg.message.domainId,
        text: msg.message.password,
    };
    const ret = await ipcRequester.send("decrypt", req);
    msg.message.password = ret.text;
    const message: Message.ExtensionsMessage = {
        type: "ReturnSavePasswordFromApp",
        message: msg.message,
        errorId: "0",
    };
    return message;
};

const checkPasswordFromList = async (msg: Message.ExtensionsMessage) => {
    let status: CredCheckStatus = "existed";
    let id: number = 0;
    let domainId: number = 0;
    let extraData = {};
    if (pluginStore.personalList !== undefined) {
        const data: Message.VaultItem<Message.VaultItemLogin>[] =
            pluginStore.personalList;
        const matcheds = data.filter((v) => {
            const item = v as Message.VaultItem;
            if (item.type === VaultItemType.Login) {
                const login = item.detail as Message.VaultItemLogin;
                return matchLogin(
                    {
                        uri: login.loginUri ?? "",
                        username: login.loginUser ?? "",
                    },
                    { uri: msg.message?.uri, username: msg.message?.username }
                );
            }
            return false;
        });
        if (matcheds.length > 0) {
            for (const matched of matcheds) {
                const old = matched;
                id = old.id;
                domainId = old.domainId;
                const req: Message.DecryptItem = {
                    text: old.detail.loginPassword,
                    domainId: old.domainId,
                };
                const ret = await ipcRequester.send("decrypt", req);
                if (ret.text !== msg.message.password) {
                    status = "update";
                    extraData = {
                        name: old.name,
                        note: old.detail.note,
                    };
                    break;
                }
            }
        } else {
            status = "new";
        }
        msg.type = "ReturnPasswordCheckingFromExtension";
        msg.message = {
            status: status,
            id: id,
            domainId: domainId,
            tabId: msg.message.tabId,
            ...extraData,
        };
    } else {
        msg.message = {
            status: status,
            id: id,
            domainId: domainId,
            tabId: msg.message.tabId,
        };
    }
    return msg;
};

const savePassword = async (msg: Message.ExtensionsMessage) => {
    const ret = await ipcRequester.send("savePassword", msg);
    return ret;
};

const returnUserProfile = async () => {
    return pluginStore.userProfileMessage;
};

const logout = async () => {
    await ipcRequester.send("logout");
};

const extensionHeartbeat = async () => {
    ipcRequester.send("extensionHeartbeat");
    const message: Message.ExtensionsMessage = {
        type: "ExtensionHeartbeat",
        message: "",
        errorId: "0",
    };
    return message;
};

const windowFocus = () => {
    pluginStore.windowFocusFn();
    pluginStore.loginFormExtension = true;
};

const getPasswordHistoryAll = async () => {
    const res = await ipcRequester.send("getPasswordHistoryAll");
    const msg: Message.ExtensionsMessage = {
        type: "GetPasswordHistoryAll",
        errorId: res.fail ? "-1" : "0",
        message: res.payload,
    };
    return msg;
};

const postPasswordHistory = async (params: Message.ExtensionsMessage) => {
    const req: any = {
        password: params.message.password,
        source: params.message.source,
        description: params.message.description,
    };
    const res = await ipcRequester.send("postPasswordHistory", req);
    const msg: Message.ExtensionsMessage = {
        type: "PostPasswordHistory",
        errorId: res.fail ? "-1" : "0",
        message: res.payload,
    };
    return msg;
};

const deletePasswordHistory = async (params: Message.ExtensionsMessage) => {
    const res = await ipcRequester.send(
        "deletePasswordHistory",
        params.message.id
    );
    const msg: Message.ExtensionsMessage = {
        type: "DeletePasswordHistory",
        errorId: res.fail ? "-1" : "0",
        message: res.payload,
    };
    return msg;
};

const deletePasswordHistoryAll = async () => {
    const res = await ipcRequester.send("deletePasswordHistoryAll");
    const msg: Message.ExtensionsMessage = {
        type: "DeletePasswordHistoryAll",
        errorId: res.fail ? "-1" : "0",
        message: res.payload,
    };
    return msg;
};

const requestHandler: RequestHandler = async (req, res, next) => {
    const msg: Message.ExtensionsMessage =
        req.body as Message.ExtensionsMessage;
    let result: Message.ExtensionsMessage = {
        type: "GetListFromExtension",
    };
    switch (msg.type) {
        case "GetFillPasswordFromExtension": //get password in cache
            result = await returnFillPasswordFromApp();
            break;
        case "GetListFromExtension": //get all item list
            result = await getAllItems();
            break;
        case "DecryptFromExtension": //fill
            result = await returnDecryptFillPasswordFromApp(msg);
            break;
        case "DecryptAndNotSendPasswordFromExtension": //go fill
            await decryptAndStoreCredential(msg);
            break;
        case "DecryptAndReturnPasswordFromExtension": //copyPassword
            result = await returnGetPasswordFromApp(msg);
            break;
        case "GetPasswordCheckingFromExtension":
            result = await checkPasswordFromList(msg);
            break;
        case "SavePasswordFromExtension":
            result = await savePassword(msg);
            break;
        case "GetUserProfileFromExtension":
            result = await returnUserProfile();
            break;
        case "LogoutFromExtension":
            await logout();
            break;
        case "LoginFromExtension":
            windowFocus();
            break;
        case "DecryptTextFromExtension":
            result = await decryptTextFromExtension(msg);
            break;
        case "GetPasswordHistoryAll":
            result = await getPasswordHistoryAll();
            break;
        case "PostPasswordHistory":
            result = await postPasswordHistory(msg);
            break;
        case "DeletePasswordHistory":
            result = await deletePasswordHistory(msg);
            break;
        case "DeletePasswordHistoryAll":
            result = await deletePasswordHistoryAll();
            break;
        case "ExtensionHeartbeat":
            extensionHeartbeat();
            result.type = "ExtensionHeartbeat";
            break;
        default:
            result = null;
    }
    if (result) {
        res.status(200).send(result);
    }
    next();
};

export default requestHandler;
