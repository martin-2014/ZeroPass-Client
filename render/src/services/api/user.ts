import { request } from 'umi';
import { requester, localRequester } from './requester';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
    return requester.get<API.UserProfile>('/api/me/UserProfile', options);
}

export async function login(params: any) {
    return requester.post('/api/Tokens', params);
}

export async function freshToken(options?: { [key: string]: any }) {
    return await requester.put('/api/Tokens', options);
}

export async function switchDomain(domainId: number) {
    return await requester.put(`/api/tokens/${domainId}`, {});
}

export async function updateSyncSetting(params: any) {
    return await requester.patch('/api/me/userProfile/sync', params);
}

export async function getActivation(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.ActivationValidate,
    options?: { [key: string]: any },
) {
    return request(`/api/Activation`, {
        method: 'GET',
        params: { ...params },
        ...(options || {}),
    });
}

/** 此处后端没有提供注释 POST /api/Domains */
export async function UpdateUserProfile(
    body: API.UpdateUserProfile,
    options?: { [key: string]: any },
) {
    return request<any>('/api/me/UserProfile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function getLoginInfo(domainName: string, loginId: string) {
    return request(`/api/Users/SwapUser/${domainName}/${loginId}`, {
        method: 'GET',
    });
}

export async function getInviteNotification() {
    return request(`/api/me/invites`, {
        method: 'GET',
    });
}

export async function changePasswrod(zpUserId: string, password: string) {}

export function loginLocal(profile: { email: string; id: number }) {
    return localRequester('login', profile);
}

export function logoutLocal() {
    return localRequester('logout');
}
