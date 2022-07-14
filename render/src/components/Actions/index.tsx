import { getPersonalLoginDetail } from '@/services/api/vaultItems';
import { AppItem, BrowserEvent, openBrowser } from '@/utils/appBrowser';
import { EditOutlined } from '@ant-design/icons';
import Popconfirm from '../Popconfirm';
import React, { useImperativeHandle } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { Share } from '@icon-park/react';
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

const getOpenInfo = async (appId: number | string) => {
    let res: { payload?: API.OpenDetail; fail: boolean } = { fail: true };
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
    return res;
};

class AppBrowserEvent extends BrowserEvent {}

type DefaultPropsItem = {
    domainId: number;
    type: 'personal';
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
        const res = await getOpenInfo(props.appId);
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
                handleClick(e, 'fill');
            }}
        />
    ) : (
        <Tooltip style={{ display: 'none' }} title={Intl.formatMessage({ id: 'common.menu.open' })}>
            <Share
                className={props.noTips ? '' : 'zp-icon'}
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick(e, 'fill');
                }}
            />
        </Tooltip>
    );
});
