import { Delete, Edit } from '@/components/Actions';
import BaseContentLayout from '@/components/BaseContentLayout';
import HubButton from '@/components/HubButton';
import { RightFormStatus } from '@/components/RightForm';
import { clientList, removeClient, getClientById } from '@/services/api/clients';
import message from '@/utils/message';
import { downloadFile, utf8BOM } from '@/utils/secretKeyDownloader';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Space } from 'antd';
import * as csvWriter from 'csv-writer';
import moment from 'moment';
import { FC, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import ClientForm from './components/ClientForm';
import ImportModal, { CsvFields } from './components/ImportModal';
import styles from './index.less';
import { AdminTableDiffHeight } from '@/utils/tools';

const MockClient: FC = () => {
    const actionRef = useRef<ActionType>();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [id, setId] = useState(0);
    const [height, setHeight] = useState(document.body.clientHeight - AdminTableDiffHeight);
    const Intl = useIntl();
    const dataList = useRef<API.MockClientItem[]>([]);
    const [dataSource, setDataSource] = useState<API.MockClientItem[]>([]);
    const searchData = useRef('');
    const [currentId, setCurrentId] = useState(0);
    const [status, setStatus] = useState<RightFormStatus>('new');
    const reload = () => {
        getData();
    };
    const [importVisible, setImportVisible] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    const columns: ProColumns<API.MockClientItem>[] = [
        {
            title: <FormattedMessage id="client.machine.name" />,
            dataIndex: 'machineName',
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="client.ip" />,
            dataIndex: 'proxyAddress',
        },
        {
            title: <FormattedMessage id="client.description" />,
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: <FormattedMessage id="common.status" />,
            render: (_, record) => {
                return (
                    <div>
                        {record.isActive ? (
                            <FormattedMessage id="client.active" />
                        ) : (
                            <FormattedMessage id="client.inactive" />
                        )}
                    </div>
                );
            },
        },
        {
            title: '',
            width: 130,
            render: (_, record) => {
                const handleConfirm = async (e: Event) => {
                    e.stopPropagation();
                    const res = await removeClient({ id: record.id });
                    if (res && res.error?.id) {
                        message.errorIntl(res.error.id);
                    } else {
                        message.success(Intl.formatMessage({ id: 'common.delete.success' }));
                        getData();
                    }
                };

                const edit = (e: Event) => {
                    setVisible(true);
                    setId(record.id);
                    setStatus('edit');
                };

                return (
                    <Space
                        style={{
                            float: 'right',
                            marginRight: 10,
                            display: record.id === currentId ? '' : 'none',
                        }}
                        size={20}
                    >
                        <Edit onClick={edit} />
                        <Delete comfirm={handleConfirm} />
                    </Space>
                );
            },
        },
    ];

    const getData = async () => {
        setLoading(true);
        const data = await clientList();
        if (data) {
            dataList.current = data.payload;
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

    const handleSearch = () => {
        const data = filterData(dataList.current, ['machineName', 'proxyAddress', 'description']);
        setDataSource(data);
    };

    const handleAdd = () => {
        setVisible(true);
        setStatus('new');
    };
    const handleCancel = () => {
        setVisible(false);
    };

    const filterData = (data: API.MockClientItem[], needFilters: string[]) => {
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

    const exportCsv = async () => {
        setImportLoading(true);
        try {
            const createCsvWriter = csvWriter.createObjectCsvStringifier;
            const writer = createCsvWriter({
                header: [
                    { id: 'machineName', title: CsvFields.description },
                    { id: 'description', title: CsvFields.remark },
                    { id: 'isActive', title: CsvFields.isActive },
                    { id: 'realIp', title: CsvFields.ip },
                    { id: 'clientOS', title: CsvFields.clientOS },
                    { id: 'clientVersion', title: CsvFields.clientVersion },
                    { id: 'clientMachineCode', title: CsvFields.clientMachineCode },
                    { id: 'isDynamicalIp', title: CsvFields.isDynamicalIP },
                    { id: 'ipCountry', title: CsvFields.ipCountry },
                    { id: 'timeZone', title: CsvFields.timeZone },
                    { id: 'gmt', title: CsvFields.gmt },
                    { id: 'attribution', title: CsvFields.attribution },
                    { id: 'language', title: CsvFields.language },
                    { id: 'uaWindows', title: CsvFields.uaWidowns },
                    { id: 'uaMac', title: CsvFields.uaMac },
                    { id: 'uaLinux', title: CsvFields.uaLinux },
                    { id: 'isCustomizedUA', title: CsvFields.isCustomizedUA },
                    { id: 'isSyncCookieByUser', title: CsvFields.isSyncCookieByUser },
                    { id: 'proxyType', title: CsvFields.proxyType },
                    { id: 'proxyIp', title: CsvFields.proxyIp },
                    { id: 'proxyPort', title: CsvFields.proxyPort },
                    { id: 'proxyUserName', title: CsvFields.proxyUserName },
                    { id: 'proxyPassword', title: CsvFields.proxyPassword },
                    { id: 'proxyVersion', title: CsvFields.proxyVersion },
                    { id: 'proxyCountry', title: CsvFields.proxyCountry },
                    { id: 'proxyState', title: CsvFields.proxyState },
                    { id: 'proxyCity', title: CsvFields.proxyCity },
                ],
            });

            let data: {}[] = [];
            for (const record of dataSource) {
                const response = await getClientById(record.id);
                const client: any = response.payload;
                let row = {};
                row['clientOS'] = client.clientOS;
                row['clientVersion'] = client.clientVersion;
                row['clientMachineCode'] = client.clientMachineCode;
                row['realIp'] = client.realIp;
                row['isDynamicalIp'] = client.isDynamicalIp;
                row['ipCountry'] = client.ipCountry;
                row['timeZone'] = client.timeZone;
                row['gmt'] = client.gmt;
                row['attribution'] = client.attribution;
                row['language'] = client.language;
                row['uaWindows'] = client.uaWindows;
                row['uaMac'] = client.uaMac;
                row['uaLinux'] = client.uaLinux;
                row['machineName'] = client.machineName;
                row['isActive'] = client.isActive;
                row['isCustomizedUA'] = client.isCustomizedUA;
                row['isSyncCookieByUser'] = client.isSyncCookieByUser;
                row['description'] = client.description;
                row['proxyType'] = client.proxy.type;
                row['proxyIp'] = client.proxy.ip;
                row['proxyPort'] = client.proxy.port;
                row['proxyUserName'] = client.proxy.username;
                row['proxyPassword'] = client.proxy.password;
                row['proxyVersion'] = client.proxy.version;
                row['proxyCountry'] = client.proxy.country;
                row['proxyState'] = client.proxy.state;
                row['proxyCity'] = client.proxy.city;
                data.push(row);
            }

            const content = `${utf8BOM}${writer.getHeaderString()}${writer.stringifyRecords(data)}`;
            let fileName = `ClientContainer-${moment().format('YYYYMMDD')}.csv`;
            downloadFile(fileName, content);
        } finally {
            setImportLoading(false);
        }
    };

    const importCsv = async () => {
        setImportVisible(true);
    };

    return (
        <BaseContentLayout
            onSearch={handleChange}
            header={
                <>
                    <HubButton onClick={handleAdd} width={70}>
                        {'+ ' + Intl.formatMessage({ id: 'pages.searchTable.new' })}
                    </HubButton>
                </>
            }
            extraHeader={
                <Space size={15}>
                    <HubButton
                        onClick={(e) => {
                            importCsv();
                        }}
                        width={70}
                    >
                        {Intl.formatMessage({ id: 'pages.searchTable.import' })}
                    </HubButton>
                    <HubButton
                        loadingVisible={importLoading}
                        onClick={(e) => {
                            exportCsv();
                        }}
                        width={70}
                    >
                        {Intl.formatMessage({ id: 'pages.searchTable.export' })}
                    </HubButton>
                </Space>
            }
        >
            <>
                <div className={styles.main}>
                    <ProTable<API.MockClientItem>
                        scroll={{ y: height }}
                        loading={loading}
                        columns={columns}
                        actionRef={actionRef}
                        dataSource={dataSource}
                        tableAlertRender={false}
                        cardProps={{
                            bodyStyle: {
                                paddingTop: '0px',
                                paddingBottom: '0px',
                            },
                        }}
                        onRow={(record) => {
                            return {
                                onClick: (event) => {
                                    if (event.target.cellIndex != 4) {
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
                            persistenceKey: 'mock-of-client-machine',
                            persistenceType: 'localStorage',
                        }}
                        options={{
                            reload: false,
                            density: false,
                            setting: false,
                        }}
                        rowKey="id"
                        search={false}
                        dateFormatter="string"
                    />
                    <ClientForm
                        visible={visible}
                        cancel={handleCancel}
                        id={id}
                        reload={reload}
                        status={status}
                    />
                </div>
                <ImportModal
                    visible={importVisible}
                    close={() => setImportVisible(false)}
                    reload={reload}
                />
            </>
        </BaseContentLayout>
    );
};

export default MockClient;
