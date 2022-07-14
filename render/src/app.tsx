import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading, MenuDataItem } from '@ant-design/pro-layout';
import { RunTimeLayoutConfig, RequestConfig } from 'umi';
import { history } from 'umi';
import { currentUser as queryCurrentUser } from '@/services/api/user';
import type { RequestOptionsInit } from 'umi-request';
import { baseUrl } from '@/.hub/config';
import message from '@/utils/message';
import { freshToken } from '@/services/api/user';
import Header from '@/components/Header';
import { sessionStore, localStore } from '@/browserStore/store';
import { IconMap } from '@/components/MenuIcon';
import LeftContent from '@/components/LeftContent';
import Menus from '@/components/Menus';
import { priceRequester } from '@/services/api/cryptos';
import { getLocalTimeZone } from '@/hooks/useLocalTime';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const logoutPath = '/user/logout';
const whiteList = [
    '/user/login',
    '/user/domain/register',
    '/user/domain/register/result',
    '/user/activate',
    '/user/password/forgot',
    '/user/activate/result',
];

export const initialStateConfig = {
    loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

const fresh = async () => {
    window.freshToken = setTimeout(fresh, 1000 * 10 * 10);
    const res = await freshToken();
    if (!res.fail) {
        sessionStore.token = res.payload.token;
    }
};

const freshPriceToken = async () => {
    window.freshPriceTokenTimeout = setTimeout(freshPriceToken, 5 * 60 * 1000);
    await priceRequester.syncCoinInfo();
};

export async function getInitialState(): Promise<{
    settings?: Partial<LayoutSettings>;
    currentUser?: API.UserProfile & Partial<API.domain>;
    fetchUserInfo: () => Promise<API.UserProfile | undefined>;
}> {
    sessionStore.deviceId = await window.electron.GetDeviceId();
    const fetchUserInfo = async () => {
        try {
            if (!sessionStore.token && sessionStore.token.length) {
                return undefined;
            }
            const res = await queryCurrentUser();

            if (res.fail) {
                return undefined;
            }

            //use local timezone
            const responsePayload = { ...res.payload, timezone: getLocalTimeZone() }!;
            if (window.electron) {
                const msg: Message.ExtensionsMessage = {
                    type: 'ReturnUserProfileFromApp',
                    message: {
                        ...responsePayload,
                        isLocked: sessionStore.lock === 'true',
                    },
                    errorId: '0',
                };
                electron.sendUserProfile(msg);
            }
            let data = responsePayload;
            for (const domain of responsePayload.domains!) {
                if (domain.domainType === 1) {
                    data = {
                        ...data,
                        photo: domain.logo,
                        setting: domain.setting,
                        personalDomain: domain,
                    };
                    break;
                }
            }
            return data;
        } catch (error) {
            history.push(loginPath);
        }
        return undefined;
    };

    if (!whiteList.includes(history.location.pathname)) {
        const currentUser = await fetchUserInfo();
        if (!currentUser) {
            history.push('/user/login');
        }
        return {
            fetchUserInfo,
            currentUser,
            settings: {},
        };
    }
    return {
        fetchUserInfo,
        settings: {},
    };
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
    return {
        menuDataRender: customMenuDataRender,
        headerRender: Header,
        breadcrumbRender: false,
        onPageChange: () => {
            const { location } = history;
            if (!whiteList.includes(location.pathname)) {
                if (!initialState?.currentUser) {
                    history.push(loginPath);
                } else if (!window.freshToken && initialState?.currentUser) {
                    fresh();
                    freshPriceToken();
                }
            }
        },
        layout: 'side',
        theme: 'light',
        navTheme: 'light',
        headerHeight: 51,
        headerTheme: 'light',
        fixSiderbar: true,
        menuHeaderRender: LeftContent,
        ...initialState?.settings,
        menuContentRender: Menus,
        collapsedButtonRender: false,
    };
};

const customMenuDataRender = (menuData: MenuDataItem[]): MenuDataItem[] => {
    return menuData.map((item) => {
        return {
            ...item,
            icon:
                typeof item.icon === 'string' && item.icon.indexOf('|icon') > -1
                    ? IconMap[item.icon.replace('|icon', '')]
                    : item.icon,
            children: item.children ? customMenuDataRender(item.children) : [],
        };
    });
};

const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
    const authHeader = { Authorization: `Bearer ${sessionStore.token}` };
    const deviceIdHeader = { 'Device-Id': sessionStore.deviceId };
    const { headers, ...otherOptions } = options;
    return {
        url: `${url}`,
        options: {
            ...otherOptions,
            interceptors: true,
            headers: { ...headers, ...authHeader, ...deviceIdHeader },
        },
    };
};

const responseInterceptor = async (response: Response, options: RequestOptionsInit) => {
    if (response.status === 401) {
        if (!response.url.endsWith('/api/Tokens')) history.push(logoutPath);
        return { error: { id: 'err_authentication_failed' } };
    }
    if (response.status === 403) {
        return { error: { id: 'err_forbidden' } };
    }
    if (response.status === 500) {
        return { error: { id: 'err_server_error' } };
    }
    if (response.status !== 200) {
        return { error: { id: 'err_unknown_error' } };
    }
    const data = await response.clone().json();
    if (data && data.errors && !data.error) {
        data.error = {};
        if (Object.values(data.errors).length) {
            data.error.id = Object.values(data.errors)[0][0];
        }
    }
    return data;
};

const errorHandler = (error) => {
    const { response } = error;
    if (!response) {
        if (error.type === 'Timeout') {
            message.errorIntl('err_time_out');
        } else {
            message.errorIntl('err_internal_error');
        }
    }
    return false;
};

export const request: RequestConfig = {
    prefix: baseUrl,
    timeout: 30000,
    errorHandler,
    requestInterceptors: [authHeaderInterceptor],
    responseInterceptors: [responseInterceptor],
};
