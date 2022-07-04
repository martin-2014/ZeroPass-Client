import message from '@/utils/message';
import { request } from 'umi';
import { requester } from './requester';
type Result = {
    error?: {
        id: string;
    };
    payload: {
        results?: string[];
        totalCount: number;
    };
};

export type IpResult = {
    error: {
        id?: string;
    };
    payload: {
        ip: string;
        country: string;
        gmt: string;
        isp: string;
        timezone: string;
        country_Name: string;
        city: string;
        region: string;
        latitude: string;
        longitude: string;
        level: number;
    };
};

export type MachineItem = {
    id: number;
    machineName: string;
    description: string;
    isActive: boolean;
    proxyAddress: string;
    items: { id: number; name: string }[];
    disabled?: boolean;
};

export async function clientList(params?: {}, options?: { [key: string]: any }) {
    const id = params?.id;
    let path = `/api/Machines`;
    if (id) {
        path = `${path}/${id}`;
    }
    const data = await request(path, {
        method: 'GET',
        params: {},
        ...(options || {}),
    });
    return data;
}

export async function getClientById(id: number) {
    return requester.get(`/api/Machines/${id}`);
}

export function createClient(data: any) {
    return requester.post('/api/machines', data);
}

export async function bindClientList() {
    return requester.get<MachineItem[]>('/api/Machines/bind');
}

export function ipSearch(options?: { [key: string]: any }) {
    return request<IpResult>('/api/Machines/IpSearch', {
        method: 'GET',
        params: {
            ...(options || {}),
        },
    });
}

export async function addClient(options?: { [key: string]: any }) {
    const res = await request<Result>('/api/Machines', {
        method: 'POST',
        ...(options || {}),
    });
    return res;
}

export async function removeClient(options?: { [key: string]: any }) {
    const id = options.id;
    const res = await request<Record<string, any>>(`/api/Machines/${id}`, {
        method: 'DELETE',
    });
    if (res.error?.Id) {
        message.errorIntl(res.error.Id);
    }
    return res;
}

export async function updateClient(options?: { [key: string]: any }) {
    return request<Result>('/api/Machines', {
        method: 'PUT',
        ...(options || {}),
    });
}

export async function getClientUa(options?: { [key: string]: any }) {
    return request('/api/Machines/UserAgent', {
        method: 'GET',
        ...(options || {}),
    });
}

export async function getClientLanguage(options?: { [key: string]: any }) {
    return request('/api/Machines/Language', {
        method: 'GET',
        ...(options || {}),
    });
}
