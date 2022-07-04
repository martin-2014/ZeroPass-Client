// @ts-ignore
/* eslint-disable */
import { requester } from './requester';

export type DetailPayload = {
    id: number;
    appEntryDescription: string;
    groupIds: number[];
    lastModifiedBy: string;
    lastModifyTime: string;
};

export type UserAccessDetail = {
    appEntryId: number;
    appEntryDescription: string;
    groupIds: number[];
    lastModifiedBy: string;
    lastModifyTime: string;
};

export function getAppEntryGroupAccessWithId(id: number) {
    return requester.get<DetailPayload>(`/api/AppEntry/${id}/GroupAccess`);
}

export function updateAppEntryGroupAccess(payload: any) {
    return requester.put('/api/AppEntry/GroupAccess', payload);
}

export function getAppEntryUserAccessWithId(id: number) {
    return requester.get<UserAccessDetail>(`/api/AppEntry/${id}/UserAccess`);
}

export function updateAppEntryUserAccess(payload: any) {
    return requester.put('/api/AppEntry/UserAccess', payload);
}
