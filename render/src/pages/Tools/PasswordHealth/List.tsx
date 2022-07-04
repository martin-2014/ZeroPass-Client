import { FormattedMessage, useIntl } from 'umi';
import { Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useState } from 'react';
import styles from './List.less';
import useResizeHeight from '@/components/HubList/useResizeHeight';
import { Title } from '@/components/HubList';
import { Harm, PreviewCloseOne, PreviewOpen } from '@icon-park/react';
import { OpenDefaultBrowser } from '@/components/Actions';
import { localStore } from '@/browserStore/store';

const { Text } = Typography;

export type Item<T = {}> = {
    key: string | number;
    title: string;
    description?: string;
    icon: JSX.Element;
    loginPassword: string;
    passwordStrength?: 'low' | 'medium';
    timeToLive?: number;
} & T;

export interface ListProps<T> {
    type: 'old' | 'weak';
    data: Item<T>[];
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
}

const HubList = function <T>(props: ListProps<T>) {
    const { data } = props;
    const { height } = useResizeHeight();
    const [passwordIsShow, setPasswordIsShow] = useState(false);
    const Intl = useIntl();

    const handleShowPassword = () => {
        setPasswordIsShow((d) => !d);
    };

    const baseColumns: ColumnsType<Item<T>> = [
        {
            title: <FormattedMessage id={'common.title'} />,
            dataIndex: 'title',
            key: 'title',
            render: (_, record) => {
                return <Title {...record}></Title>;
            },
            sorter: (a, b) => {
                return a.title > b.title ? 1 : -1;
            },
        },
        {
            title: (
                <div className={styles.passwordTitle}>
                    <FormattedMessage id={'common.password'} />
                    <span onClick={handleShowPassword}>
                        <PreviewCloseOne
                            className="zp-icon"
                            style={{ display: passwordIsShow ? 'none' : '', marginLeft: 5 }}
                        />
                        <PreviewOpen
                            className="zp-icon"
                            style={{ display: passwordIsShow ? '' : 'none', marginLeft: 5 }}
                        />
                    </span>
                </div>
            ),
            dataIndex: 'loginPassword',
            key: 'loginPassword',
            render: (text) => {
                return (
                    <>
                        {passwordIsShow ? (
                            <Text ellipsis={{ tooltip: text }}>{text}</Text>
                        ) : (
                            <span>*********</span>
                        )}
                    </>
                );
            },
        },
        {
            title: (
                <Text
                    ellipsis={{ tooltip: Intl.formatMessage({ id: 'common.password.strength' }) }}
                >
                    {Intl.formatMessage({ id: 'common.password.strength' })}
                </Text>
            ),
            dataIndex: 'passwordStrength',
            key: 'passwordStrength',
            render: (text) => {
                const localeText = 'common.' + text;
                return (
                    <div>
                        <Harm
                            size={16}
                            theme="filled"
                            fill={text === 'low' ? '#fd6e6e' : '#fdc86d'}
                        ></Harm>
                        <span style={{ marginLeft: 10 }}>
                            <FormattedMessage id={localeText} />
                        </span>
                    </div>
                );
            },
            sorter: (a, b) => {
                return a.passwordStrength === 'low' ? -1 : 1;
            },
        },
        {
            width: 80,
            render: (_, record) => {
                return (
                    <div>
                        <OpenDefaultBrowser
                            type="personal"
                            appId={record.key}
                            domainId={localStore.personalDomainId}
                        />
                    </div>
                );
            },
        },
    ];
    if (props.type === 'old') {
        baseColumns.splice(2, 1, {
            title: (
                <Text ellipsis={{ tooltip: Intl.formatMessage({ id: 'common.age' }) }}>
                    {Intl.formatMessage({ id: 'common.age' })}
                </Text>
            ),
            dataIndex: 'timeToLive',
            key: 'timeToLive',
            render: (text) => {
                return (
                    <div>
                        <span>
                            {text + ' '}
                            <FormattedMessage id="common.days" />
                        </span>
                    </div>
                );
            },
            sorter: (a, b) => {
                return a.timeToLive! - b.timeToLive!;
            },
        });
    }
    return (
        <Table
            className={styles.table}
            dataSource={data}
            columns={baseColumns}
            scroll={{
                y: height,
            }}
            pagination={false}
        />
    );
};

export default HubList;
