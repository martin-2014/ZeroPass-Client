import styles from './GroupList.less';
import { Empty, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Title } from '@/components/HubList';
import { OpenDefaultBrowser } from '@/components/Actions';
import { localStore } from '@/browserStore/store';
import React, { useState } from 'react';
import ScrollContainter from '@/components/ScrollContainter';
import Group from '@/pages/Tools/PasswordHealth/Group';
import { PreviewCloseOne, PreviewOpen } from '@icon-park/react';
import { FormattedMessage } from 'umi';

export type Item<T = {}> = {
    key: string | number;
    title: string;
    description?: string;
    icon: JSX.Element;
    loginPassword: string;
} & T;

export interface ListProps<T> {
    data: Item<T>[][];
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
}
const { Text } = Typography;
export default function <T>(props: ListProps<T>) {
    const [passwordIsShow, setPasswordIsShow] = useState(false);

    const handleShowPassword = () => {
        setPasswordIsShow((d) => !d);
    };
    const baseColumns: ColumnsType<Item<T>> = [
        {
            dataIndex: 'title',
            key: 'title',
            render: (_, record) => {
                return <Title {...record}></Title>;
            },
        },
        {
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
    return (
        <div className={styles.wrapper}>
            <table className={styles.headerWrapper} style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    <col />
                    <col />
                    <col style={{ width: 80 }} />
                </colgroup>
                <thead className="ant-table-thead">
                    <tr>
                        <th className="ant-table-cell">
                            <div className={styles.headerContainer}>
                                <FormattedMessage id="common.title" />
                            </div>
                        </th>
                        <th className="ant-table-cell">
                            <div className={styles.headerContainer}>
                                <span>
                                    <FormattedMessage id="common.password" />
                                </span>
                                <span onClick={handleShowPassword}>
                                    <PreviewCloseOne
                                        className="zp-icon"
                                        style={{
                                            display: passwordIsShow ? 'none' : '',
                                            marginLeft: 5,
                                        }}
                                    />
                                    <PreviewOpen
                                        className="zp-icon"
                                        style={{
                                            display: passwordIsShow ? '' : 'none',
                                            marginLeft: 5,
                                        }}
                                    />
                                </span>
                            </div>
                        </th>
                        <th className="ant-table-cell"></th>
                    </tr>
                </thead>
            </table>
            <div className={styles.content}>
                <ScrollContainter>
                    <ul className={styles.ul}>
                        {props.data.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            props.data.map((item, index) => {
                                return (
                                    <Group
                                        key={index}
                                        dataSource={item}
                                        columns={baseColumns}
                                    ></Group>
                                );
                            })
                        )}
                    </ul>
                </ScrollContainter>
            </div>
        </div>
    );
}
