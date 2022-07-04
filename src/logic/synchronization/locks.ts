import { repos } from "../../repositories";
import { machineId } from "node-machine-id";
import ipcRequester from "../../IpcRequester";

const getDeviceId = async () => {
    let deviceId = await repos.appConfigs.getDeviceId();
    if (deviceId === undefined) {
        deviceId = await machineId();
        await repos.appConfigs.setDeviceId(deviceId);
    }
    return deviceId;
};

const createPersonalLock = async () => {
    return await lockRequest("create");
};

const updatePersonalLock = async () => {
    return await lockRequest("update");
};

const freePersonalLock = async () => {
    return await lockRequest("free");
};

const lockRequest = async (action: Message.LockAction) => {
    const deviceId = await getDeviceId();
    const req: Message.LockRequest = {
        action: action,
        data: { deviceId: deviceId },
    };
    const result = await ipcRequester.send("lockOperation", req);
    return !result.fail;
};

export { createPersonalLock, updatePersonalLock, freePersonalLock };
