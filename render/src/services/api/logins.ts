import { requester } from './requester';
import { VaultItemView } from './vaultItems';

export type DomainUsers = {
    domainId: number;
    id: number;
    email: string;
    userName: string;
    isDomainOwner: boolean;
    isDomainAdmin: boolean;
    status: number;
    isActive: boolean;
    createTime: string;
    updateTime: string;
};

export type Grant = {
    domainUsers: DomainUsers[];
    groupUsers: {
        groupName: string;
        domainUsers: DomainUsers[];
    }[];
};

export async function getUserAndGroup() {
    return await requester.get<Grant>('/api/DomainUsers/grant');
}
export type AppDetail = {
    id?: number;
    type?: number;
    description: string;
    loginUri: string;
    loginUser: string;
    loginPassword: string;
    passwordUpdateTime?: string;
    oneTimePassword: string | null;
    note: string | null;
    clientMachineId: number | null;
    createTime?: string;
    updateTime?: string;
    tagIds: number[];
    tags: { id: number; name: string }[];
    accesses: AccessItem[];
    name?: string;
};

export type AccessItem = {
    id?: number;
    domainId?: number;
    vaultItemId?: string;
    userId: number;
    canAssign: boolean;
    userName?: string;
    email?: string;
};

export type WorkDetail = AppDetail & {
    clientMachineName: string;
};

export type Access = {
    userId: number;
    canAssign: boolean;
};

export type LoginDetail = {
    clientMachineId: number | null;
    loginPassword: string;
    loginUri: string;
    loginUser: string;
    note?: string;
};

export type PersonalVaultItem = VaultItemView<LoginDetail>;
export type WorkVaultItem = VaultItemView<LoginDetail>;

export async function getLoginDetail(id: number) {
    return requester.get(`/api/apps/${id}`);
}

export function createLogin(data: AppDetail) {
    return requester.post('/api/apps', data);
}

export function updateLogin(data: AppDetail) {
    return requester.put('/api/apps', data);
}

export function deleteLogin(id: number) {
    return requester.delete(`/api/apps/${id}`);
}

export function getWorkLogins() {
    return requester.get<WorkVaultItem[]>('/api/me/items/work/typed/0');
}

export function getWorkLoginDetail(id: number) {
    return requester.get<WorkDetail>(`/api/me/apps/work/${id}`);
}

export type LoginCreateModel = {
    id?: number;
    description: string;
    loginUri: string;
    loginUser: string;
    loginPassword: string;
    clientMachineId?: number | null;
    tagIds?: (number | undefined)[];
    note?: string;
};

export function createPersonalLogin(data: LoginCreateModel) {
    return requester.post<{ id: number }>(`/api/me/apps/personal`, data);
}

export function updatePersonalLogin(data: LoginCreateModel) {
    return requester.put(`/api/me/apps/personal`, data);
}

export type OpenDetail = {
    id: number;
    address: string;
    loginUser: string;
    loginPassword: string;
    name: string;
    machineEnvData?: {
        userId: string;
        containerId: string;
        containerName: string;
        networkId: string;
        accessToken: string;
        proxyBriefData: {
            ip: string;
            type: string;
            region: string;
            timezone: string;
        };
    };
};

export function getPersonalAppOpen(id: number | string) {
    return requester.get<OpenDetail>(`/api/me/apps/personal/${id}/open`);
}

export function getWorkAppOpen(id: number | string) {
    return requester.get<OpenDetail>(`/api/me/apps/work/${id}/open`);
}

export function getManagerAppOpen(id: number | string) {
    return requester.get<OpenDetail>(`/api/apps/${id}/open`);
}
