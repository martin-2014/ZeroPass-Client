import { request } from 'umi';
import { requester, localRequester } from './requester';

export async function currentUser(options?: { [key: string]: any }) {
    return requester.get<API.UserProfile>('/api/me/UserProfile', options);
}

export async function freshToken(options?: { [key: string]: any }) {
    return await requester.put('/api/Tokens', options);
}

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

export function loginLocal(profile: { email: string; id: number }) {
    return localRequester('login', profile);
}

export function logoutLocal() {
    return localRequester('logout');
}
