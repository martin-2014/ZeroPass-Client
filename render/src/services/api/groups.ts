// @ts-ignore
/* eslint-disable */
import { requester } from './requester';

export type member = {
    userId: number;
    email: string;
};
export type GroupDetail = {
    id: number;
    name: string;
    description: string;
    createTime: string;
    createBy: number;
    updateTime: string;
    updatedBy: number;
    createByName: string;
    updatedByName: string;
    members: member[];
};
export interface GroupItem {
    id: number;
    name: string;
    description: string;
}

export async function listGroups() {
    return await requester.get<GroupItem[]>('/api/Groups');
}

export async function addGroup(payload: any) {
    return await requester.post('/api/Groups', payload);
}

export async function deleteGroup(id: number) {
    return await requester.delete(`/api/groups/${id}`);
}

export async function getGroupDetail(id: number) {
    return await requester.get<GroupDetail>(`/api/Groups/${id}`);
}

export async function updateGroup(payload: any) {
    return await requester.put('/api/Groups', payload);
}
