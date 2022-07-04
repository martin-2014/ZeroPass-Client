import { useRef, useState, useEffect } from 'react';
import { Space, Typography } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { FormattedMessage, useIntl } from 'umi';
import { filterData, getFaviconUrl } from '@/utils/tools';
import { errHandlers } from '@/services/api/errHandlers';
import { getAppUsedReport } from '@/services/api/reports';
import { useLocalTimeSimple } from '@/hooks/useLocalTime';
import * as xlsx from 'xlsx';
import { downloadFile } from '@/utils/secretKeyDownloader';
import HubButton from '@/components/HubButton';
import Image from '@/components/Image';
import moment from 'moment';
import BaseContentLayout from '@/components/BaseContentLayout';
import IconMap from '../Home/components/IconMap';
import { VaultItemType } from '@/services/api/vaultItems';
import { AdminTableDiffHeight } from '@/utils/tools';

const { Text } = Typography;

export default () => {
    const Intl = useIntl();
    const actionRef = useRef<ActionType>();
    const [height, setHeight] = useState(document.body.clientHeight - AdminTableDiffHeight);
    const dataList = useRef<API.AppUsedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState<API.AppUsedReport[]>([]);
    const searchData = useRef('');
    const getlocalTime = useLocalTimeSimple();

    const columns: ProColumns<API.AppUsedReport>[] = [
        {
            title: <FormattedMessage id="reports.web.login" />,
            render: (_, record) => {
                const uri = getFaviconUrl(record.loginUri);
                return (
                    <div style={{ display: 'flex' }}>
                        <div
                            style={{
                                boxShadow: '0px 1px 3.8px 0.2px rgb(0 0 0 / 10%)',
                                borderRadius: 10,
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                defaulticon={IconMap(VaultItemType.Login, 24)}
                                src={uri}
                                style={{
                                    flexShrink: 0,
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 15,
                                }}
                            />
                        </div>

                        <Text
                            ellipsis={{ tooltip: true }}
                            style={{
                                height: '30px',
                                lineHeight: '30px',
                                marginLeft: '5px',
                                paddingRight: '37px',
                            }}
                        >
                            {record.vaultItemName}
                        </Text>
                    </div>
                );
            },
            sorter: (a, b) => a.vaultItemName.localeCompare(b.vaultItemName),
            ellipsis: false,
        },
        {
            title: <FormattedMessage id="reports.assignee" />,
            dataIndex: 'userName',
            sorter: (a, b) => a.userName.localeCompare(b.userName),
            ellipsis: true,
        },
        // {
        //     title: (
        //         <FormattedMessage
        //             id='reports.list.userType'
        //         />
        //     ),
        //     render: (_, record) => {
        //         return (
        //             <Text title={Intl.formatMessage({id: 'common.userName'})}>{getRoleTextTag(record)}</Text>
        //         )
        //     },
        //     sorter: (a, b) => getRoleText(a).localeCompare(getRoleText(b)),
        //     ellipsis: true,
        // },
        {
            title: <FormattedMessage id="reports.permission" />,
            render: (_, record) => {
                return <Text>{getPrivilegeTextTag(record)}</Text>;
            },
            sorter: (a, b) => getPrivilegeText(a).localeCompare(getPrivilegeText(b)),
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="reports.list.lastUsed" />,
            render: (_, record) => {
                return <Text>{getLastUsedTime(record)}</Text>;
            },
            sorter: (a, b) => getLastUsedTime(a).localeCompare(getLastUsedTime(b)),
            ellipsis: true,
        },
    ];

    const getLastUsedTime = (record: API.AppUsedReport) => {
        return record.lastUsed ? getlocalTime(record.lastUsed) : '';
    };

    const getRoleText = (record: API.AppUsedReport) => {
        if (record.isOwner) {
            return Intl.formatMessage({ id: 'users.role.owner' });
        }
        if (record.isAdmin) {
            return Intl.formatMessage({ id: 'users.role.admin' });
        } else {
            return Intl.formatMessage({ id: 'users.role.user' });
        }
    };

    const getRoleTextTag = (record: API.AppUsedReport) => {
        if (record.isOwner) {
            return <FormattedMessage id="users.role.owner" />;
        }
        if (record.isAdmin) {
            return <FormattedMessage id="users.role.admin" />;
        } else {
            return <FormattedMessage id="users.role.user" />;
        }
    };

    const getPrivilegeTextTag = (record: API.AppUsedReport) => {
        if (record.canAssign == null) {
            return '';
        } else {
            return record.canAssign ? (
                <FormattedMessage id="reports.list.app.privilege.canAssign" />
            ) : (
                <FormattedMessage id="reports.list.app.privilege.accessOnly" />
            );
        }
    };

    const getPrivilegeText = (record: API.AppUsedReport) => {
        if (record.canAssign == null) {
            return '';
        } else {
            return record.canAssign
                ? Intl.formatMessage({ id: 'reports.list.app.privilege.canAssign' })
                : Intl.formatMessage({ id: 'reports.list.app.privilege.accessOnly' });
        }
    };

    const exportExcel = () => {
        var workbook = xlsx.utils.book_new();
        const headDesc = Intl.formatMessage({ id: 'reports.web.login' });
        const headUserName = Intl.formatMessage({ id: 'reports.assignee' });
        const headPrivilege = Intl.formatMessage({ id: 'reports.permission' });
        const headLastUsed = Intl.formatMessage({ id: 'reports.list.lastUsed' });
        var datas = dataSource.map((record) => {
            let result = {};
            result[headDesc] = record.vaultItemName;
            result[headUserName] = record.userName;
            result[headPrivilege] = getPrivilegeText(record);
            result[headLastUsed] = getLastUsedTime(record);
            return result;
        });
        workbook.SheetNames.push('data');
        workbook.Sheets['data'] = xlsx.utils.json_to_sheet(datas);
        var file = xlsx.write(workbook, { bookType: 'xlsx', bookSST: true, type: 'array' });
        var fileName = `Report-${moment().format('YYYYMMDD')}.xlsx`;
        downloadFile(fileName, file);
    };

    const getPrivilege = (record: API.AppUsedReport) => {
        return record.canAssign ? 0 : 1;
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
        const res = await getAppUsedReport();
        if (res.fail) {
            errHandlers.default(res);
        } else {
            const data = res.payload!.map((item, index) => {
                return { id: index, ...item };
            });
            dataList.current = data.sort((a, b) => {
                return getPrivilege(a) - getPrivilege(b);
            });
        }
        setLoading(false);
        handleSearch();
    };

    const handleSearch = () => {
        const tempData = dataList.current.map((v) => {
            return {
                ...v,
                privilege: getPrivilegeText(v),
                type: getRoleText(v),
            };
        });
        const data = filterData(
            tempData,
            ['vaultItemName', 'userName', 'privilege', 'type'],
            searchData.current,
        );
        setDataSource(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchData.current = e.target.value;
        handleSearch();
    };

    return (
        <BaseContentLayout
            onSearch={handleChange}
            header={
                <HubButton
                    onClick={(e) => {
                        exportExcel();
                    }}
                    width={70}
                >
                    {Intl.formatMessage({ id: 'reports.button.export' })}
                </HubButton>
            }
        >
            <div>
                <ProTable<API.AppUsedReport>
                    scroll={{ y: height }}
                    columns={columns}
                    actionRef={actionRef}
                    dataSource={dataSource}
                    cardProps={{
                        bodyStyle: {
                            paddingTop: '0px',
                            paddingBottom: '0px',
                        },
                    }}
                    tableAlertRender={false}
                    loading={loading}
                    onRow={(record) => {
                        return {
                            onClick: (event) => {}, // 点击行
                            onDoubleClick: (event) => {},
                            onContextMenu: (event) => {},
                            onMouseEnter: (event) => {}, //鼠标移入行
                            onMouseLeave: (event) => {},
                            onBlur: () => {},
                        };
                    }}
                    rowKey="id"
                    search={false}
                    dateFormatter="string"
                    options={{
                        reload: false,
                        density: false,
                        setting: false,
                    }}
                />
            </div>
        </BaseContentLayout>
    );
};
