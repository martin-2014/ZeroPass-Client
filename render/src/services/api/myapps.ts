import { requester } from '@/services/api/requester';

export async function getMyApps() {
    return await requester.get<any>('/api/me/apps');
}

export async function getMyStarApps() {
    return await requester.get<any>('/api/me/apps/starred');
}

export async function putMyApp(body: API.MyAppsItem) {
    return requester.put<any>('/api/me/apps', body);
}

export async function getMyAppDetail(id: number) {
    return await requester.get<any>(`/api/me/apps/${id}`);
}
