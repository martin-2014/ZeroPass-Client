import { localRequester, requester } from './requester';

export const mergeData = async (params: Message.SyncParams) => {
    return await localRequester('mergeData', params);
};

export const isSyncing = (status: string) => {
    return status != 'normal' && status != 'error' && status != 'timeout' && status != 'done';
};

export const checkIsMerging = async () => {
    const res = await localRequester('getMergeStatus');
    if (!res.fail && isSyncing(res.payload?.status)) {
        res.payload = true;
    } else {
        res.payload = false;
    }
    return res;
};

export const getMergeStatus = async () => {
    return await localRequester('getMergeStatus');
};

interface IpfsCidInfo {
    cid: string;
    peerId: string;
    latestCid: string;
    latestStatus: string;
}

export const getPersonalCid = () => {
    return requester.get<IpfsCidInfo>('/api/pin/path/root');
};
