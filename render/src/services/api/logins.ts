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
