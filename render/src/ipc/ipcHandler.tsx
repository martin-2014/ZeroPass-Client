import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { freePersonalDb, lockPersonalDb, updatePersonalDbLock } from '@/services/api/locks';
import {
    deletePasswordHistory,
    deletePasswordHistoryAll,
    getPasswordHistoryAll,
    PasswordHistoryItem,
    postPasswordHistory,
} from '@/services/api/password';
import { requester } from '@/services/api/requester';
import { currentUser } from '@/services/api/user';
import {
    createPersonalItem,
    getAllItems,
    getPersonalLoginDetail,
    updatePersonalItem,
    VaultItemType,
} from '@/services/api/vaultItems';
import { IsPersonalItem } from '@/utils/tools';
import { cloneDeep } from 'lodash';
import { history } from 'umi';
import { getPersonalAllItems } from '@/ipc/ipcHandlerProxy';

const decrypt = async (data: Message.DecryptItem) => {
    const cryptoService = new TCryptoService();
    data.text = await cryptoService.decryptText(data.text, IsPersonalItem(data.domainId));
    return data;
};

const logout = () => {
    history.push('/user/logout');
};

const savePassword = async (msg: Message.ExtensionsMessage) => {
    const cred = msg.message;
    if (cred == undefined) {
        msg.errorId = 'credential is null';
        return msg;
    }
    let result;
    if (cred.id) {
        result = await updateCredential(msg);
    } else {
        result = await createCredential(msg);
    }
    if (!result.errorId) {
        syncItemListToPlugin();
    }
    return result;
};

const createCredential = async (msg: Message.ExtensionsMessage) => {
    var cryptoService = new TCryptoService();
    const cred = msg.message;
    const item: Message.VaultItem = {
        name: cred.description,
        description: cred.username,
        type: VaultItemType.Login,
        detail: {
            loginUser: cred.username,
            loginUri: cred.uri,
            loginPassword: await cryptoService.encryptText(cred.password, true),
            note: cred.note,
        },
    };
    const res = await createPersonalItem<{ id: string }>(item);
    if (res.fail) {
        msg.errorId = res.errorId;
    } else {
        msg.message.id = res.payload?.id;
    }
    return msg;
};

const updateCredential = async (msg: Message.ExtensionsMessage) => {
    var cryptoService = new TCryptoService();
    const cred = msg.message;
    const itemResult = await getPersonalLoginDetail<Message.VaultItem<API.LoginDetail>>(cred.id);
    if (itemResult.fail) {
        msg.errorId = itemResult.errorId;
        return msg;
    }
    let item = cloneDeep(itemResult.payload!);

    item.name = cred.description;
    item.description = cred.username;
    item.detail = {
        ...item.detail,
        loginUser: cred.username,
        loginUri: cred.uri,
        loginPassword: await cryptoService.encryptText(cred.password, true),
        note: cred.note,
    };

    const res = await updatePersonalItem(item);
    if (res.fail) {
        msg.errorId = res.errorId;
    }
    return msg;
};

const cryptoService = new TCryptoService();

const ipcController: { [key in Message.IpcMethod]: (data: any) => any } = {
    decrypt: async (data: Message.DecryptItem) => {
        return await decrypt(data);
    },
    toLogin: async (data: any) => {
        return '';
    },
    logout: async (data: any) => {
        logout();
    },
    getList: async (data: any) => {
        return await getPersonalAllItems();
    },
    savePassword: async function (data: any) {
        return await savePassword(data);
    },
    getPasswordHistoryAll: async (data: any) => {
        return await getPasswordHistoryAll();
    },
    postPasswordHistory: async (data: PasswordHistoryItem) => {
        data.password = await cryptoService.encryptText(data.password, true);
        return await postPasswordHistory(data);
    },
    deletePasswordHistory: async (data: any) => {
        return await deletePasswordHistory(data);
    },
    deletePasswordHistoryAll: async () => {
        return await deletePasswordHistoryAll();
    },
    lockOperation: async (data: any) => {
        const req = data as Message.LockRequest;
        if (req.action === 'create') {
            return await lockPersonalDb(req.data);
        } else if (req.action === 'free') {
            return await freePersonalDb(req.data);
        } else {
            return await updatePersonalDbLock(req.data);
        }
    },
    restfulapiRequest: async (data: any) => {
        const req = data as Message.HttpRequest;
        if (req.method === 'GET') {
            return await requester.get<string>(req.url);
        } else if (req.method === 'PUT') {
            return requester.put<string>(req.url, req.param);
        } else {
            console.log(`call the webApi: ${req.url} with parame: ${req.param}`);
            return await requester.post<string>(req.url, req.param);
        }
    },
    extensionHeartbeat: () => {},
    getUserInfo: async (data: any) => {
        const user = await currentUser();
        return user;
    },
};

const ipcRequestRouter = async (msg: Message.RequestMessage): Promise<any> => {
    let result: Message.RequestMessage = msg;
    result.data = await ipcController[msg.method](msg.data);
    return result;
};

const ipcRequester = {
    startUp: function () {
        if (electron) {
            electron.initIpcRequest(ipcRequestRouter);
        }
    },
};

export const syncItemListToPlugin = async () => {
    if (electron) {
        const res = await getPersonalAllItems();
        electron.sendAllAppList(res);
    }
};

export default ipcRequester;
