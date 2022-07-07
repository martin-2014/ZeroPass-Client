import ipcRequester from "../IpcRequester";
import pluginStore from "./pluginStore";

const formatList = (data: any[]) => {
    return data.map((item) => ({
        ...item,
        alias: item.alias || item.name,
    }));
};

const storeItemList = (list: any) => {
    const [personal] = list;
    pluginStore.personalList = !personal.fail
        ? formatList(personal.payload)
        : [];
    const message: Message.ExtensionsMessage = {
        type: "ReturnListFromApp",
        message: [...pluginStore.personalList],
    };
    return message;
};

const getAllItems = async () => {
    const [personal] = await ipcRequester.send("getList");
    if (personal.fail) {
        return;
    }
    return storeItemList([personal]);
};

export { storeItemList, getAllItems };
