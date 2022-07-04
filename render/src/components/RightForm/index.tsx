import styles from './index.less';
import HubButton from '@/components/HubButton';
import { Space, Spin, Drawer, Tooltip } from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import { useEffect, useState } from 'react';
import { useLocalTime } from '@/hooks/useLocalTime';
import ScrollContainter from '../ScrollContainter';
import { CloseSmall, Edit } from '@icon-park/react';

export type FormHeader = {
    title: string;
    imgUri: string;
};

export type RightFormStatus = 'new' | 'edit' | 'view';

export type Props = {
    visible: boolean;
    title?: JSX.Element | string;
    editEnable?: boolean;
    children: JSX.Element;
    onSave?: () => void;
    onCancel?: () => void;
    onEdit?: () => void;
    createTime?: string;
    updateTime?: string;
    status?: RightFormStatus;
    loading?: boolean;
    disabledSave?: boolean;
    footer?: JSX.Element;
    createTitle?: JSX.Element | string;
    position?: 'auto' | 'static';
    actions?: React.ReactNode[];
};

const RightForm = (props: Props) => {
    const Intl = useIntl();
    const [createTime, setCreateTime] = useState('');
    const [updateTime, setUpdateTime] = useState('');

    const getTime = useLocalTime();

    useEffect(() => {
        const createTime = props.createTime ? getTime(props.createTime) : '';
        setCreateTime(createTime);
        const updateTime = props.updateTime ? getTime(props.updateTime) : '';
        setUpdateTime(updateTime);
    }, [props.createTime, props.updateTime]);

    return (
        <Drawer
            className={styles.main}
            visible={props.visible}
            closable={false}
            mask={props.status === 'edit' || props.status === 'new'}
            width={526}
            bodyStyle={{ padding: 0 }}
            onClose={props.onCancel}
            maskClosable={false}
            destroyOnClose={true}
            getContainer={document.getElementById('base-content-layout') ?? undefined}
            style={{ position: 'absolute' }}
            zIndex={998}
        >
            <Spin spinning={props.loading} style={{ height: '100%' }}>
                <div className={styles.wrapper}>
                    <div className={styles.header}>
                        <div style={{ display: 'flex', position: 'relative' }}>
                            <div style={{ width: 24, marginLeft: 10 }} onClick={props.onCancel}>
                                <Tooltip title={Intl.formatMessage({ id: 'common.close' })}>
                                    <CloseSmall className="zp-icon-red" size={18} strokeWidth={6} />
                                </Tooltip>
                            </div>

                            <div
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    position: 'absolute',
                                    right: 0,
                                    display: props.status == 'view' ? 'flex' : 'none',
                                }}
                            >
                                {props.editEnable != false ? (
                                    <div
                                        style={{
                                            marginRight: 10,
                                        }}
                                        onClick={props.onEdit}
                                    >
                                        <Tooltip
                                            title={Intl.formatMessage({
                                                id: 'common.menu.edit',
                                            })}
                                        >
                                            <Edit size={18} className="zp-icon" />
                                        </Tooltip>
                                    </div>
                                ) : (
                                    <></>
                                )}
                                {props.actions?.map((item, index) => (
                                    <div key={index}>{item}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles.content}>
                        <ScrollContainter>{props.children}</ScrollContainter>
                    </div>
                    <div
                        className={styles.footerButton}
                        style={{ display: props.status == 'view' ? 'none' : '' }}
                    >
                        {props.footer == undefined ? (
                            <Space>
                                <HubButton type="default" width={85} onClick={props.onCancel}>
                                    {Intl.formatMessage({ id: 'common.cancel' })}
                                </HubButton>
                                <HubButton
                                    width={85}
                                    disable={props.disabledSave}
                                    className={styles.button}
                                    onClick={props.onSave}
                                    loadingVisible={props.loading}
                                >
                                    {Intl.formatMessage({ id: 'common.save' })}
                                </HubButton>
                            </Space>
                        ) : (
                            <>{props.footer}</>
                        )}
                    </div>
                    {createTime || updateTime ? (
                        <div className={styles.footerOther}>
                            <Space style={{ display: createTime ? '' : 'none' }}>
                                <span>
                                    {props.createTitle ? (
                                        props.createTitle
                                    ) : (
                                        <FormattedMessage id="common.create.time" />
                                    )}
                                </span>
                                <span>{createTime}</span>
                            </Space>
                            <Space style={{ display: updateTime ? '' : 'none' }}>
                                <span>
                                    <FormattedMessage id="common.last.modified.time" />
                                </span>
                                <span>{updateTime}</span>
                            </Space>
                        </div>
                    ) : (
                        <div style={{ height: 10 }}></div>
                    )}
                </div>
            </Spin>
        </Drawer>
    );
};

export default RightForm;
