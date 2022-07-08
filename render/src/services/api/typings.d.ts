declare namespace API {
    type DomainRegister = {
        registeredFirstName?: string;
        registeredLastName?: string;
        registeredEmail?: string;
        registeredPhone?: string;
        domainName?: string;
        company?: string;
        numberOfEmployees?: string;
        country?: string;
        timezone?: string;
        language?: string;
        password?: string;
    };

    type ActivationValidate = {
        DomainName: string;
        Code: string;
    };

    type Activation = {
        domainName?: string;
        code?: string;
        loginId?: number;
        password?: string;
        email?: string;
        domainId?: number;
    };

    type DomainUpdateModel = {
        company: string;
        contactPhone: string;
        contactPerson: string;
        country: string;
        logo?: string;
    };

    type UpdateUserProfile = {
        userName?: string;
        timezone?: string;
        photo?: string;
    };

    type UserModel = {
        domainId?: number;
        id?: number;
        firstName?: string;
        lastName?: string;
        isDomainOwner?: boolean;
        isDomainAdmin?: boolean;
        isActivate?: boolean;
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
    type DomianProfile = {
        id: number;
        country: string;
        timezone: string;
        language: string;
        logo: string;
    };

    type MockClientItem = {
        id: number;
        machineName: string;
        proxyAddress: string;
        description: string;
        isActive: boolean;
    };

    type MyAppsItem = {
        id: number;
        machineName?: string;
        appEntryDescription?: string;
        appEntryLoginUri?: string;
        appEntryLoginUser?: string;
        alias: string;
        star: boolean;
    };

    type ResendCodeItem = {
        email: string;
        isResend: boolean;
        id: number;
    };

    type UserApproveItem = {
        userId: number;
        approve: boolean;
        cipherSharedKey?: string;
    };

    type UserChangeRoleItem = {
        userId: number;
        isAdmin: boolean;
    };

    type RegisterItem = {
        accountType?: number;
        domain?: string;
        email: string;
        timezone?: string;
    };

    type UserListItem = {
        id: number;
        email: string;
        isDomainAdmin: boolean;
        isDomainOwner: boolean;
        status: number;
        userName: string;
        domainId: number;
        zpUserId: string;
    };

    type DomainUserItem = {
        domainId: number;
        id: number;
        email: string;
        userName: string;
        isDomainOwner: boolean;
        isDomainAdmin: boolean;
        status: number;
        createTime: string;
        updateTime: string;
    };

    type AppUsedReport = {
        domainId: number;
        vaultItemId: number;
        vaultItemName: string;
        userId: number;
        userName: string;
        email: string;
        canAssign: boolean;
        lastUsed: string;
        loginUri: string;
        isOwner: boolean;
        isAdmin: boolean;
    };

    type InviteUserResult = {
        existedEmails: string[];
        ownerEmails: string[];
    };
}
