import { useLocalTimeSimple } from '@/hooks/useLocalTime';
import { FormattedMessage, useModel } from 'umi';
import { Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import useResizeHeight from '@/components/HubList/useResizeHeight';

const { Text } = Typography;

export type Item<T = {}> = {
    key: string;
    title: string;
    description?: string;
    lastUsed: string;
    icon: JSX.Element;
} & T;

export interface ListProps<T> {
    data: Item<T>[];
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
    toolbarRender?: (data: Item<T>) => JSX.Element;
    onClick?: (data: Item<T>) => void;
}
const getTableHeight = () => {
    return document.body.clientHeight - 330;
};

export const Title = (record: Omit<Item, 'lastUsed' | 'key'>) => {
    return (
        <div className={styles.titleWrapper}>
            <div className={styles.titleIconContainter}>{record.icon}</div>
            {record.description ? (
                <div className={styles.titleContent}>
                    <Text className={styles.title} ellipsis={{ tooltip: record.title }}>
                        {record.title}
                    </Text>
                    <Text className={styles.description} ellipsis={{ tooltip: record.description }}>
                        {record.description}
                    </Text>
                </div>
            ) : (
                <div className={styles.titleContent}>
                    <Text className={styles.title} ellipsis={{ tooltip: record.title }}>
                        {record.title}
                    </Text>
                </div>
            )}
        </div>
    );
};

const HubList = function <T>(props: ListProps<T>) {
    const { data, toolbarRender, onClick } = props;
    const ToolbarRender = (data: Item<T>) => {
        if (toolbarRender) {
            return toolbarRender(data);
        }
        return () => <></>;
    };
    const { height } = useResizeHeight();
    const getTime = useLocalTimeSimple();
    const { timeAgo } = useModel('timeAgo');
    const [selectedId, setSelectedId] = useState('');

    const getTimeText = (dateTime: any) => {
        return dateTime ? timeAgo.format(Date.parse(getTime(dateTime))) : undefined;
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

            width: '50%',
        },
        {
            title: <FormattedMessage id={'common.lastUsed'} />,
            dataIndex: 'lastUsed',
            key: 'lastUsed',
            render: (text) => {
                return <div className={styles.last}>{getTimeText(text)}</div>;
            },
            sorter: (a, b) => {
                return a.lastUsed > b.lastUsed ? -1 : 1;
            },
        },
        {
            key: 'toolbar',
            render: (_, record) => {
                return (
                    <div style={{ display: record.key === selectedId ? '' : 'none' }}>
                        {ToolbarRender(record)}
                    </div>
                );
            },
        },
    ];

    const findTr: (el: HTMLElement) => null | HTMLElement = (el) => {
        if (el.tagName === 'TR') {
            return el;
        }
        if (el.parentElement) {
            return findTr(el.parentElement);
        }
        return null;
    };

    return (
        <Table
            className={styles.table}
            dataSource={data}
            columns={baseColumns}
            scroll={{
                y: height,
            }}
            onRow={(record) => ({
                onClick: (e) => {
                    onClick?.(record);
                    e.stopPropagation();
                },
                onMouseEnter: (event) => {
                    setSelectedId(record.key);
                }, //鼠标移入行
                onMouseLeave: (event) => {
                    setSelectedId('');
                },
            })}
            pagination={false}
        />
    );
};

export default HubList;
