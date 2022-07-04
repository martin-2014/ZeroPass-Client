// @ts-ignore
/* eslint-disable */
import { requester } from './requester';

export type Membership = {
    groupName: string;
    groupDescription: string;
    userName: string;
    membershipType: number;
};

export type AppEntryPrivilege = {
    appEntryDescription: string;
    groupName: string;
    userName: string;
};

export function getOverviewMemberships() {
    return requester.get<Membership[]>('/api/Overview/memberships');
}

export function getAppEntryPrivileges() {
    return requester.get<AppEntryPrivilege[]>('/api/Overview/AppEntryPrivileges');
}
