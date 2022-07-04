import { requester } from './requester';

const PERSONAL_LOCK_URL = '/api/me/locks/personal';

export const lockPersonalDb = async (info: any) => {
    return await requester.post(PERSONAL_LOCK_URL, info);
};

export const freePersonalDb = async (info: any) => {
    return await requester.delete(PERSONAL_LOCK_URL, info);
};

export const updatePersonalDbLock = async (info: any) => {
    return await requester.put(PERSONAL_LOCK_URL, info);
};
