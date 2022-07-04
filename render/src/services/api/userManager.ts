// @ts-ignore
/* eslint-disable */
import { requester } from './requester';

const USER_URI = '/api/users';
const INVITE_URI = '/api/invites';

export type ResultItem = {
    id: number;
    loginName: string;
    email: string;
    isDomainOwner: boolean;
    isDomainAdmin: boolean;
    isActive: boolean;
    groups: UserGroup[];
    status?: number;
};
export type UserGroup = {
    groupId: number;
    name: string;
};
export type DetailItem = ResultItem & {
    firstName: string;
    lastName: string;
    createTime: string;
    createdByName: string;
    updateTime: string;
    updatedByName: string;
    groups: UserGroup[];
};
export type UserUpdateItem = {
    isActive: boolean;
    isAdmin: boolean;
    userId: number;
    groups: UserGroup[];
};

type ResultWithId = {
    error?: {
        id: string;
    };
    payload: DetailItem;
};

export async function userList() {
    return requester.get<API.UserListItem[]>(USER_URI);
}

export const getUserById = (id: number) => {
    return requester.get<DetailItem>(`${USER_URI}/${id}`);
};

export async function updateUser(data: UserUpdateItem) {
    return await requester.put(USER_URI, data);
}

export async function addUser(data: string[]) {
    return await requester.post<API.InviteUserResult>(`${INVITE_URI}/sendcode`, { emails: data });
}

export async function approveUser(data: API.UserApproveItem) {
    return await requester.put(`${INVITE_URI}/approve`, data);
}

export async function changeUserRole(data: API.UserChangeRoleItem) {
    return await requester.patch(`${USER_URI}/role`, data);
}

export async function removeUser(userId: number) {
    return await requester.delete(`${USER_URI}/${userId}`);
}

export async function disableUser(userId: number, disable: boolean) {
    return await requester.patch(`${USER_URI}/status`, { id: userId, isActive: !disable });
}

export async function getInviteInfo() {
    return await requester.get(INVITE_URI);
}

export async function rejectInvite(params) {
    return await requester.delete(INVITE_URI, params);
}

export async function acceptInvite(domainId: number) {
    return await requester.post(`${INVITE_URI}/accept`, { domainId: domainId });
}
