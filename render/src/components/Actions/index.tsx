import { getManagerAppOpen, getWorkAppOpen, OpenDetail } from '@/services/api/logins';
import { getPersonalLoginDetail } from '@/services/api/vaultItems';
import { AppItem, BrowserEvent, listAllBrowserStatusSync, openBrowser } from '@/utils/appBrowser';
import { EditOutlined, LoadingOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Popconfirm from '../Popconfirm';
import React, { memo, useEffect, useImperativeHandle } from 'react';
import { FormattedMessage, useIntl, useModel } from 'umi';
import { Share, OpenOne } from '@icon-park/react';
import message from '@/utils/message';
import { Tooltip } from 'antd';
import { Delete as DeleteIcon } from '@/Icons';

interface PropsItem {
    comfirm?: (e: any) => void;
    onClick?: (e: any) => void;
    display?: boolean;
    size?: number;
}

export const Delete = (props: PropsItem) => {
    const Intl = useIntl();

    const handleClick = (e) => {
        e.stopPropagation();
    };
    return (
        <Popconfirm
            title={<FormattedMessage id="common.delete" />}
            okText={<FormattedMessage id="common.yes" />}
            cancelText={<FormattedMessage id="common.no" />}
            onConfirm={props.comfirm}
            onCancel={handleClick}
        >
            <Tooltip title={Intl.formatMessage({ id: 'common.menu.delete' })}>
                <DeleteIcon className={'zp-icon'} onClick={handleClick} />
            </Tooltip>
        </Popconfirm>
    );
};

export const Edit = (props: PropsItem) => {
    const Intl = useIntl();

    const handleClick = (e) => {
        e.stopPropagation();
        props.onClick!(e);
    };
    return (
        <Tooltip title={Intl.formatMessage({ id: 'common.menu.edit' })}>
            <EditOutlined onClick={handleClick} className={'zp-icon'} />
        </Tooltip>
    );
};

enum AppType {
    PERSONAL = 0,
    WORKASSIGN = 1,
    MANAGER = 2,
}

enum BrowserStatus {
    Running = 0,
    Waiting = 1,
    InProgress = 2,
    Failed = 3,
    Closed = 4,
}

interface AppPropsItem extends PropsItem {
    type: 'manager' | 'workassign' | 'personal';
    appId: number | string;
    setProgress?: (progress: number) => void;
    setStatus?: (status: StatusItem) => void;
    containerId: null | string;
    superBrowserStatus?: BrowserStatus;
    noTips?: boolean;
}

export type StatusItem = 'closed' | 'opening' | 'opened' | 'fail';

const getOpenInfo = async (type: AppPropsItem['type'], appId: number | string) => {
    let res: { payload?: OpenDetail; fail: boolean } = { fail: true };
    if (type == 'manager') {
        res = await getManagerAppOpen(appId);
    } else if (type == 'workassign') {
        res = await getWorkAppOpen(appId);
    } else {
        const detail = await getPersonalLoginDetail(appId);
        if (!detail.fail) {
            const info = detail.payload!;
            res = {
                payload: {
                    ...info,
                    address: info.loginUri,
                    loginUser: info.loginUser,
                    loginPassword: info.loginPassword,
                    name: info.name,
                },
                fail: false,
            };
        }
    }
    return res;
};

class AppBrowserEvent extends BrowserEvent {}

export const openSuper = React.forwardRef((props: AppPropsItem, ref: any) => {
    const { superStatus, setSuperStatus } = useModel('superBrowser');
    const Intl = useIntl();
    const key = props.appId.toString();

    const setStatus = (status: number) => {
        superStatus[key] = status;
        setSuperStatus({ ...superStatus });
    };

    const handleClick = async (e?: Event) => {
        if (e) {
            e.stopPropagation();
            setStatus(1);
        }
        const res = await getOpenInfo(props.type, props.appId);
        if (!res.fail && res.payload) {
            var item: AppItem = new AppItem(res.payload);
            item.domainId = -1;
            const eventHandle = new AppBrowserEvent();
            const containerId = item.containerBrief?.containerId;
            if (containerId != undefined) {
                eventHandle.onBeforeStarting = () => {};
                eventHandle.onProgress = (progress: number) => {};
                eventHandle.onStartedCompleted = (successful: boolean) => {
                    if (!successful) {
                        message.errorIntl('common.open.fail');
                        setStatus(3);
                    } else {
                        setStatus(0);
                    }
                };
                eventHandle.onClose = () => {
                    setStatus(4);
                };
            }
            openBrowser(item, eventHandle);
        } else {
        }
    };

    useImperativeHandle(ref, () => ({
        onClick: () => {
            setStatus(1);
            handleClick();
        },
    }));

    const getRunningContainer = () => {
        try {
            let status = -1;
            const ret = listAllBrowserStatusSync();
            for (let r of ret) {
                if (r.ContainerID == props.containerId) {
                    status = r.Status;
                    if ([0, 1, 2].includes(status)) {
                        setStatus(status);
                        handleClick();
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        getRunningContainer();
    }, []);

    if (superStatus[key] == 1 || superStatus[key] == 2) {
        return (
            <LoadingOutlined
                onClick={(e) => e.stopPropagation()}
                style={
                    props.noTips
                        ? {}
                        : {
                              fontSize: 16,
                              opacity: 0.5,
                          }
                }
                spin
            />
        );
    } else if (superStatus[key] == 0) {
        return props.noTips ? (
            <MinusCircleOutlined
                onClick={(e) => e.stopPropagation()}
                style={
                    props.noTips
                        ? {}
                        : {
                              fontSize: 16,
                              opacity: 0.5,
                          }
                }
            />
        ) : (
            <Tooltip title={Intl.formatMessage({ id: 'vault.action.running' })}>
                <MinusCircleOutlined
                    onClick={(e) => e.stopPropagation()}
                    style={
                        props.noTips
                            ? {}
                            : {
                                  fontSize: 16,
                                  opacity: 0.5,
                              }
                    }
                />
            </Tooltip>
        );
    } else {
        return props.noTips ? (
            <OpenOne
                theme="outline"
                onClick={(e) => {
                    handleClick(e);
                }}
                className={props.noTips ? '' : 'zp-icon'}
            />
        ) : (
            <Tooltip title={Intl.formatMessage({ id: 'common.menu.open' })}>
                <OpenOne
                    theme="outline"
                    onClick={(e) => {
                        handleClick(e);
                    }}
                    className={props.noTips ? '' : 'zp-icon'}
                />
            </Tooltip>
        );
    }
});

export const OpenSuperBrowser = memo(openSuper, (pre, next) => {
    return pre.appId === next.appId;
});

type DefaultPropsItem = {
    domainId: number;
    type: 'manager' | 'workassign' | 'personal';
    appId: number | string;
    action?: 'login' | 'fill' | 'goto';
    size?: number;
    noTips?: boolean;
};

export const OpenDefaultBrowser = React.forwardRef((props: DefaultPropsItem, ref: any) => {
    const Intl = useIntl();

    const handleClick = async (
        e?: Event | null,
        action?: Message.openDefaultBrowserType | undefined,
    ) => {
        if (e) e.stopPropagation();

        if (props.action != undefined) action = props.action;
        const res = await getOpenInfo(props.type, props.appId);
        if (!res.fail && res.payload) {
            var item: AppItem = new AppItem(res.payload);
            (item.domainId = props.domainId), (item.type = action);
            const eventHandle = new AppBrowserEvent();
            openBrowser(item, eventHandle);
        } else {
        }
    };

    useImperativeHandle(ref, () => ({
        onClick: handleClick,
    }));

    return props.noTips ? (
        <Share
            className={props.noTips ? '' : 'zp-icon'}
            onClick={(e) => {
                e.stopPropagation();
                if (props.type === 'manager') {
                    handleClick(e, '');
                } else {
                    handleClick(e, 'fill');
                }
            }}
        />
    ) : (
        <Tooltip style={{ display: 'none' }} title={Intl.formatMessage({ id: 'common.menu.open' })}>
            <Share
                className={props.noTips ? '' : 'zp-icon'}
                onClick={(e) => {
                    e.stopPropagation();
                    if (props.type === 'manager') {
                        handleClick(e, '');
                    } else {
                        handleClick(e, 'fill');
                    }
                }}
            />
        </Tooltip>
    );
});
