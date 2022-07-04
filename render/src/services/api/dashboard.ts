import { request } from 'umi';
import { requester } from './requester';

export async function getTopUsedClients(
    params: { top: number; beginDate: string; endDate: string },
    options?: { [key: string]: any },
) {
    return request('/api/Overview/ClientMachineVisitedStats', {
        method: 'GET',
        params: params,
        ...(options || {}),
    });
}

export async function getTopAppEntris(params: { top: number; beginDate: string; endDate: string }) {
    return requester.get('/api/Overview/AppEntryVisitedStats', params);
}

export async function getTopApps(
    params: { top: number; beginDate: string; endDate: string },
    options?: { [key: string]: any },
) {
    return request('/api/Overview/AppVisitedStats', {
        method: 'GET',
        params: params,
        ...(options || {}),
    });
}

export async function getUserState() {
    return await requester.get('/api/Overview/UserStats');
}

export async function getClientState() {
    return await requester.get('/api/Overview/ClientMachineStats');
}

export async function getTopGroupUser(
    params: { top: number; beginDate: string; endDate: string },
    options?: { [key: string]: any },
) {
    return request('/api/Overview/GroupMembershipStats', {
        method: 'GET',
        params: params,
        ...(options || {}),
    });
}

export async function getGroups() {
    return request('/api/Overview/GroupStats', {
        method: 'GET',
    });
}

export async function getAppState() {
    return await requester.get('/api/overview/appcount');
}

export async function getPendingUsers() {
    return await requester.get<API.DomainUserItem[]>('/api/overview/pendingusers');
}
