import { useRef, useState, useEffect } from 'react';
import { Space } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import * as Users from '@/services/api/userManager';
import { FormattedMessage, useIntl, useModel } from 'umi';
import UserForm from './components/UserForm';
import InviteModal from './components/InviteModal';
import HubOption, { OptionType } from '@/components/HubOption';

import HubButton from '@/components/HubButton';
import { getKeyStore } from '@/models/keyStore';
import { Delete, Edit } from '@/components/Actions';
import { RightFormStatus } from '@/components/RightForm';
import message from '@/utils/message';
import BaseContentLayout from '@/components/BaseContentLayout';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { AdminTableDiffHeight } from '@/utils/tools';

export enum UserStatusType {
    Pendding = 0,
    Active = 1,
    Inactive = 2,
    Approve = 3,
    Reject = 4,
}

export const UserStatusOptions: OptionType[] = [
    {
        value: UserStatusType.Pendding,
        label: 'users.status.pendding',
        type: 'red',
    },
    {
        value: UserStatusType.Active,
        label: 'users.status.active',
        type: 'blue',
    },
    {
        value: UserStatusType.Inactive,
        label: 'users.status.inactive',
        type: 'red',
    },
    {
        value: UserStatusType.Approve,
        label: 'users.status.approve',
        type: 'blue',
    },
    {
        value: UserStatusType.Reject,
        label: 'users.status.reject',
        type: 'red',
    },
];

export enum UserRoleType {
    Owner = 0,
    Admin = 1,
    User = 2,
}

export const UserRoleOptions: OptionType[] = [
    {
        value: UserRoleType.Owner,
        label: 'users.role.owner',
        type: 'red',
    },
    {
        value: UserRoleType.Admin,
        label: 'users.role.admin',
        type: 'orange',
    },
    {
        value: UserRoleType.User,
        label: 'users.role.user',
        type: 'blue',
    },
];

export default () => {
    const Intl = useIntl();
    const actionRef = useRef<ActionType>();
    const [params, setParams] = useState<API.UserItem | Object>({});
    const [page, setPage] = useState<{ current: number }>({ current: 1 });
    const [visible, setVisible] = useState(false);
    const [inviteVisible, setInviteVisible] = useState(false);
    const [id, setId] = useState(0);
    const [height, setHeight] = useState(document.body.clientHeight - AdminTableDiffHeight);

    const dataList = useRef<API.UserListItem[]>([]);
    const [dataSource, setDataSource] = useState<API.UserListItem[]>([]);
    const searchData = useRef('');
    const [currentId, setCurrentId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<RightFormStatus>('new');
    const { initialState } = useModel('@@initialState');

    const reload = () => {
        getData();
    };

    const deleteUser = async (e: Event, userId: number) => {
        e.stopPropagation();
        setLoading(true);
        kickUser(userId);
        setLoading(false);
    };

    const kickUser = async (userId: number) => {
        const res = await Users.removeUser(userId);
        if (res.fail) {
            message.errorIntl(res.errorId);
            return;
        } else {
            message.success(Intl.formatMessage({ id: 'common.delete.success' }));
        }
        getData();
    };

    const approveUserItem = async (record: Users.ResultItem, approve: boolean) => {
        let approveItem: API.UserApproveItem = {
            userId: record.id,
            approve: approve,
        };
        if (approve) {
            var cryptoService = new TCryptoService();
            const sharedKey = await cryptoService.generateSharedKey(record.id);
            if (sharedKey.length == 0) {
                message.error(Intl.formatMessage({ id: 'users.keyShare.failed' }));
                return;
            }
            approveItem.cipherSharedKey = sharedKey;
        }
        const res = await Users.approveUser(approveItem);
        if (!res.fail) {
            message.success(Intl.formatMessage({ id: 'common.save.success' }));
            if (approve) {
                const keyStore = await getKeyStore();
                const result = await keyStore?.approveUser(record.email);
                // if(!result){
                //     message.error('failed to share the key')
                // }
            }
            getData();
        } else {
            message.errorIntl(res.errorId);
            getData();
        }
    };

    const changeStatus = async (record: Users.ResultItem, selection: string | number) => {
        setLoading(true);
        if (selection == UserStatusType.Approve) {
            await approveUserItem(record, true);
        } else if (selection == UserStatusType.Reject) {
            await approveUserItem(record, false);
        } else {
            const res = await Users.disableUser(record.id, selection == UserStatusType.Inactive);
            if (!res.fail) {
                message.success(Intl.formatMessage({ id: 'common.save.success' }));
                getData();
            } else {
                message.errorIntl(res.errorId);
                getData();
            }
        }
        setLoading(false);
    };

    const changeRole = async (id: number, isAdmin: boolean) => {
        setLoading(true);
        const res = await Users.changeUserRole({
            userId: id,
            isAdmin: isAdmin,
        });
        setLoading(false);
        if (!res.fail) {
            message.success(Intl.formatMessage({ id: 'common.save.success' }));
            getData();
        } else {
            message.errorIntl(res.errorId);
            getData();
        }
    };

    const columns: ProColumns<Users.ResultItem>[] = [
        {
            title: <FormattedMessage id="userProfile.email" />,
            dataIndex: 'email',
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="common.status" />,
            render: (_, record) => {
                let disable: boolean = false;
                if (
                    record.isDomainOwner ||
                    record.id == initialState?.currentUser?.id ||
                    !initialState?.currentUser?.isAdmin ||
                    (record.isDomainAdmin && !initialState.currentUser.isOwner)
                ) {
                    disable = true;
                }
                const getOptions = () => {
                    let filters = [
                        UserStatusType.Pendding,
                        UserStatusType.Approve,
                        UserStatusType.Reject,
                    ];
                    if (record.status == UserStatusType.Pendding) {
                        filters = [UserStatusType.Active, UserStatusType.Inactive];
                    }
                    return UserStatusOptions.filter((item) => !filters.includes(+item.value));
                };
                return (
                    <div id={`user-list-status-${record.id}`}>
                        <HubOption
                            value={record.status ?? 2}
                            options={getOptions()}
                            onChange={(item) => {
                                changeStatus(record, item.value);
                            }}
                            theme="outline"
                            disable={disable}
                        />
                    </div>
                );
            },
        },
        {
            title: <FormattedMessage id="common.type" />,
            render: (_, record) => {
                let role = UserRoleType.User;
                if (record.isDomainOwner) {
                    role = UserRoleType.Owner;
                } else if (record.isDomainAdmin) {
                    role = UserRoleType.Admin;
                }
                let disable: boolean = false;
                if (
                    record.isDomainOwner ||
                    record.id == initialState?.currentUser?.id ||
                    !initialState?.currentUser?.isAdmin ||
                    record.status == 0 ||
                    !initialState?.currentUser?.isOwner
                ) {
                    disable = true;
                }

                const getOptions = () => {
                    let filters: UserRoleType[] = [];
                    if (!record.isDomainOwner) filters.push(UserRoleType.Owner);
                    return UserRoleOptions.filter((item) => !filters.includes(+item.value));
                };

                return (
                    <div id={`user-list-role-${record.id}`}>
                        <HubOption
                            value={role}
                            options={getOptions()}
                            onChange={(item) => {
                                changeRole(record.id, item.value == UserRoleType.Admin);
                            }}
                            theme="fill"
                            disable={disable}
                        />
                    </div>
                );
            },
        },
        {
            title: '',
            width: 130,
            render: (_, record) => {
                return (
                    <Space
                        style={{
                            float: 'right',
                            marginRight: 10,
                            display: record.id === currentId ? '' : 'none',
                        }}
                        size={20}
                    >
                        {record.status != UserStatusType.Pendding ? (
                            <Edit
                                onClick={(e: Event) => {
                                    setVisible(true);
                                    setId(record.id);
                                    setStatus('edit');
                                }}
                            />
                        ) : (
                            <></>
                        )}
                        {record.id != initialState?.currentUser?.id &&
                        record.status != 0 &&
                        !record.isDomainOwner ? (
                            <Delete comfirm={(e) => deleteUser(e, record.id)} />
                        ) : (
                            <></>
                        )}
                    </Space>
                );
            },
        },
    ];

    const getData = async () => {
        setLoading(true);

        const res = await Users.userList();
        if (!res.fail) {
            const data = res.payload?.sort((a, b) => a.status - b.status);
            if (data) dataList.current = data;
        }
        setLoading(false);
        handleSearch();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchData.current = e.target.value;
        handleSearch();
    };

    const filterData = (data: API.UserListItem[], needFilters: string[]) => {
        return data.filter((items) => {
            const index = Object.keys(items).findIndex((s) => {
                if (needFilters.includes(s) && items[s]) {
                    return (
                        items[s]
                            .toLocaleLowerCase()
                            .indexOf(searchData.current.toLocaleLowerCase()) > -1
                    );
                }
            });
            return index > -1;
        });
    };

    const handleSearch = () => {
        const data = filterData(dataList.current, ['email']);
        setDataSource(data);
    };

    const handleAdd = () => {
        setInviteVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };
    const handlePageChange = (pagination: { current: number }) => {
        setParams((params) => {
            return {
                ...params,
                current: pagination.current,
            };
        });
        setPage({
            current: pagination.current,
        });
    };

    return (
        <BaseContentLayout
            onSearch={handleChange}
            header={
                <HubButton onClick={handleAdd} width={100}>
                    {Intl.formatMessage({ id: 'users.invite.title' })}
                </HubButton>
            }
        >
            <>
                <ProTable<API.UserListItem>
                    loading={loading}
                    scroll={{ y: height }}
                    columns={columns}
                    actionRef={actionRef}
                    dataSource={dataSource}
                    params={params}
                    options={{
                        density: false,
                        setting: false,
                        reload: false,
                    }}
                    cardProps={{
                        bodyStyle: {
                            paddingTop: '0px',
                            paddingBottom: '0px',
                        },
                    }}
                    pagination={page}
                    onChange={handlePageChange}
                    tableAlertRender={false}
                    onRow={(record) => {
                        return {
                            onClick: (event) => {
                                if (
                                    record.status != UserStatusType.Pendding &&
                                    event.target.cellIndex != 3
                                ) {
                                    setVisible(true);
                                    setId(record.id);
                                    setStatus('view');
                                }
                            }, // 点击行
                            onDoubleClick: (event) => {},
                            onContextMenu: (event) => {},
                            onMouseEnter: (event) => {
                                setCurrentId(record.id);
                            }, //鼠标移入行
                            onMouseLeave: (event) => {
                                setCurrentId(0);
                            },
                            onBlur: () => {},
                        };
                    }}
                    columnsState={{
                        persistenceKey: 'userManager',
                        persistenceType: 'localStorage',
                    }}
                    rowKey="id"
                    search={false}
                    dateFormatter="string"
                />
                <UserForm
                    visible={visible}
                    cancel={handleCancel}
                    id={id}
                    reload={reload}
                    status={status}
                />
                <InviteModal visible={inviteVisible} close={() => setInviteVisible(false)} />
            </>
        </BaseContentLayout>
    );
};
