import { request } from 'umi';

export async function putDomains(body: API.DomainUpdateModel, options?: { [key: string]: any }) {
    return request<any>('/api/Domains', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

/** 此处后端没有提供注释 POST /api/Domains */
export async function postDomains(body: API.DomainRegister, options?: { [key: string]: any }) {
    return request<any>('/api/Domains', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
        ...(options || {}),
    });
}

export async function getDomains(options?: { [key: string]: any }) {
    return request(`/api/Domains`, {
        method: 'GET',
        ...(options || {}),
    });
}
