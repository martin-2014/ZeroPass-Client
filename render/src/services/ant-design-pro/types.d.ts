// @ts-ignore
/* eslint-disable */

declare namespace API {
    type LoginResult = {
        status?: string;
        type?: string;
        currentAuthority?: string;
    };

    type PageParams = {
        current?: number;
        pageSize?: number;
    };
    type group = {
        id: string;
        groupName: string;
        owner?: boolean;
    };
    type UserItem = {
        email: string;
    };
    type AdminItem = {
        id?: number;
        loginName: string;
        email: string;
        password: string;
        isActive: boolean;
        isChangeStateOnly?: boolean;
        zpUserId?: string;
        isDomainAdmin?: boolean;
    };
    type RuleList = {
        data?: any;
        /** 列表的内容总数 */
        total?: number;
        success?: boolean;
    };
    type payload = {
        pageIndex: number;
        pageSize: number;
        results: string[];
        totalCount: number;
    };
    type UserList = {
        error: Object;
        payload: payload;
    };
}
