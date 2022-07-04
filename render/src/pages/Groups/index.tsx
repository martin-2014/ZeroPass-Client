import { useRef, useState, useEffect } from 'react';
import { Space } from 'antd';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { listGroups, deleteGroup, GroupItem } from '@/services/api/groups';
import { FormattedMessage, useIntl } from 'umi';
import GroupForm from './components/GroupForm';
import { errHandlers } from '@/services/api/errHandlers';
import { filterData } from '@/utils/tools';
import { Edit, Delete } from '@/components/Actions';
import { RightFormStatus } from '@/components/RightForm';
import HubButton from '@/components/HubButton';
import BaseContentLayout from '@/components/BaseContentLayout';
import message from '@/utils/message';
import { AdminTableDiffHeight } from '@/utils/tools';

export default () => {
    const Intl = useIntl();
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [editingId, setEditingId] = useState(0);
    const [height, setHeight] = useState(document.body.clientHeight - AdminTableDiffHeight);
    const [status, setStatus] = useState<RightFormStatus>('new');
    const [loading, setLoading] = useState(true);
    const dataList = useRef<GroupItem[]>([]);
    const [dataSource, setDataSource] = useState<GroupItem[]>([]);
    const searchData = useRef('');
    const reload = () => {
        getData();
    };
    const resizeHeight = () => {
        setHeight(document.body.clientHeight - AdminTableDiffHeight);
    };
    useEffect(() => {
        getData();
        window.addEventListener('resize', resizeHeight);
        return () => {
            window.removeEventListener('resize', resizeHeight);
        };
    }, []);

    const getData = async () => {
        setLoading(true);
        const res = await listGroups();
        if (res.fail) {
            errHandlers.default(res);
        } else {
            dataList.current = res.payload!;
        }
        setLoading(false);
        handleSearch();
    };
    const handleSearch = () => {
        const data = filterData(dataList.current, ['name', 'description'], searchData.current);
        setDataSource(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchData.current = e.target.value;
        handleSearch();
    };

    const handleAdd = () => {
        setEditingId(0);
        setStatus('new');
        setDetailVisible(true);
    };

    const handleCancel = () => {
        setDetailVisible(false);
    };

    const columns: ProColumns<GroupItem>[] = [
        {
            title: <FormattedMessage id="groups.groupName" />,
            dataIndex: 'name',
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="groups.description" />,
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: '',
            width: 130,
            render: (_, record) => {
                const handleConfirm = async (e: Event) => {
                    e.stopPropagation();
                    const res = await deleteGroup(record.id);
                    if (res.fail) {
                        message.errorIntl(res.errorId);
                    } else {
                        message.success(Intl.formatMessage({ id: 'common.delete.success' }));
                        reload();
                    }
                };

                const edit = () => {
                    setEditingId(record.id);
                    setStatus('edit');
                    setDetailVisible(true);
                };

                return (
                    <Space
                        style={{
                            display: record.id === selectedId ? '' : 'none',
                            float: 'right',
                            marginRight: 10,
                        }}
                        size={20}
                    >
                        <Edit onClick={edit} display={record.id == selectedId} />
                        <Delete comfirm={handleConfirm} display={record.id == selectedId} />
                    </Space>
                );
            },
        },
    ];

    return (
        <BaseContentLayout
            onSearch={handleChange}
            header={
                <HubButton onClick={handleAdd} width={70}>
                    {'+ ' + Intl.formatMessage({ id: 'pages.searchTable.new' })}
                </HubButton>
            }
        >
            <div>
                <ProTable<GroupItem>
                    scroll={{ y: height }}
                    columns={columns}
                    dataSource={dataSource}
                    cardProps={{
                        bodyStyle: {
                            paddingTop: '0px',
                            paddingBottom: '0px',
                        },
                    }}
                    tableAlertRender={false}
                    onRow={(record) => {
                        return {
                            onClick: (event) => {
                                if (event.target.cellIndex != 2) {
                                    setStatus('view');
                                    setEditingId(record.id);
                                    setDetailVisible(true);
                                }
                            }, // 点击行
                            onDoubleClick: (event) => {},
                            onContextMenu: (event) => {},
                            onMouseEnter: (event) => {
                                setSelectedId(record.id);
                            }, //鼠标移入行
                            onMouseLeave: (event) => {
                                setSelectedId(0);
                            },
                            onBlur: () => {},
                        };
                    }}
                    rowKey="id"
                    search={false}
                    loading={loading}
                    dateFormatter="string"
                    options={{
                        setting: false,
                        reload: false,
                        density: false,
                    }}
                />
                <GroupForm
                    visible={detailVisible}
                    cancel={handleCancel}
                    id={editingId}
                    status={status}
                    reload={reload}
                />
            </div>
        </BaseContentLayout>
    );
};
