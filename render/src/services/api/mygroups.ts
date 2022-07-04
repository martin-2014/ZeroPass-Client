// @ts-ignore
/* eslint-disable */
import message from '@/utils/message';
import { request } from 'umi';

export type ResultItem = {
    id: number;
    domainId: number;
    name: string;
    description: string;
    isActive: boolean;
    createTime: string;
    createBy: number;
    updateTime: string;
    updatedBy: number;
    createByName: string;
    updatedByName: string;
    members: member[];
};
export type member = {
    userId: number;
    loginName: string;
    type: number;
};
export type DetailResult = {
    payload: ResultItem;
    error: {
        id?: string;
    };
};
export type Result = {
    error?: {
        id: string;
    };
    payload: {
        results?: ResultItem[];
        totalCount: number;
    };
};

export async function groupsList(
    params: {
        // query
        /** 当前的页码 */
        current?: number;
        /** 页面的容量 */
        pageSize?: number;
    },
    options?: { [key: string]: any },
) {
    const pageIndex = params.current;
    delete params.current;
    const msg = await request<Result>('/api/me/Groups', {
        method: 'GET',
        params: {
            pageIndex: pageIndex,
            pageSize: params.pageSize,
            ...params,
        },
        ...(options || {}),
    });
    const ruleList: API.RuleList = {
        success: !msg.error?.id,
        data: msg.payload.results,
        total: msg.payload.totalCount,
    };
    return ruleList;
}

export async function getGroupWithId(id: number) {
    const res = await request<DetailResult>(`/api/me/Groups/${id}`, {
        method: 'Get',
    });
    if (res && res.error?.id) {
        message.errorIntl(res.error?.id);
        return false;
    }
    return res;
}
export async function getGroups(params) {
    const res = await request<Result>('/api/me/Groups', {
        method: 'Get',
        params: { ...params },
    });
    if (res && res.error?.id) {
        message.errorIntl(res.error?.id);
        return false;
    }
    return res;
}
export async function updateGroups(options?: { [key: string]: any }) {
    return request<Result>('/api/me/Groups', {
        method: 'PUT',
        ...(options || {}),
    });
}

export async function getGrantedGroupsWithAppId(id: number) {
    const res = await request<Result>(`/api/me/groups/cangrant/${id}`, {
        method: 'Get',
    });
    if (res && res.error?.id) {
        message.errorIntl(res.error?.id);
        return false;
    }
    return res;
}
