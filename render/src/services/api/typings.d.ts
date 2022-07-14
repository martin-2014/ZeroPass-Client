declare namespace API {
    type UpdateUserProfile = {
        userName?: string;
        timezone?: string;
        photo?: string;
    };

    type domain = {
        company: string;
        domainId: number;
        domainName: string;
        domainType: number;
        isActive: boolean;
        isAdmin: boolean;
        isOwner: boolean;
        logo: string;
        status: number;
        zpCompanyId: string;
        setting: UserSetting;
    };

    type UserSetting = {
        sync?: {
            enable: boolean;
            type: string;
        };
    };

    type UserProfile = {
        domains: domain[];
        email: string;
        id: number;
        timezone: string;
        userName: string;
        userType: number;
        zpUserId: string;
        photo?: string;
        setting?: UserSetting;
        personalDomain: domain;
    };

    type Login = {
        password: string;
        remember?: boolean;
        email: string;
        secretKey: string;
    };

    type RegisterItem = {
        accountType?: number;
        domain?: string;
        email: string;
        timezone?: string;
    };

    type OpenDetail = {
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

    type LoginDetail = {
        clientMachineId: number | null;
        loginPassword: string;
        loginUri: string;
        loginUser: string;
        note?: string;
    };
}
