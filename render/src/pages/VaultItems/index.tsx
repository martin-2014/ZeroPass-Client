import BaseContentLayout from '@/components/BaseContentLayout';
import HubButton from '@/components/HubButton';
import Image from '@/components/Image';
import { RightFormStatus } from '@/components/RightForm';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { getItems, VaultItem, VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { downloadFile, utf8BOM } from '@/utils/secretKeyDownloader';
import { filterData, getFaviconUrl } from '@/utils/tools';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Space, Tooltip, Typography } from 'antd';
import * as csvWriter from 'csv-writer';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import Actions from './components/Actions';
import VaultForm from './components/VaultForm';
import styles from './index.less';
import ImportModal, { CsvFields } from './components/ImportModal';
import { deleteLogin } from '@/services/api/logins';
import { syncItemListToPlugin } from '@/ipc/ipcHandler';
import IconMap from '../Home/components/IconMap';
import { AdminTableDiffHeight } from '@/utils/tools';

const { Text } = Typography;

export default () => {
    const Intl = useIntl();
    const actionRef = useRef<ActionType>();
    const [visible, setVisible] = useState(false);
    const [id, setId] = useState(0);
    const [height, setHeight] = useState(document.body.clientHeight - AdminTableDiffHeight);
    const dataList = useRef<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [importLoading, setImportLoading] = useState(false);
    const [dataSource, setDataSource] = useState<VaultItem[]>([]);
    const searchData = useRef('');
    const [currentId, setCurrentId] = useState(0);
    const [status, setStatus] = useState<RightFormStatus>('new');
    const [importVisible, setImportVisible] = useState(false);

    const columns: ProColumns<VaultItem>[] = [
        {
            title: <FormattedMessage id="vault.description" />,
            render: (node, record) => {
                const uri = getFaviconUrl(record.loginUri);
                return (
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
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
                            {record.name}
                        </Text>
                    </div>
                );
            },
            ellipsis: false,
        },
        {
            title: <FormattedMessage id="vault.userName" />,
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: (
                <Text ellipsis={{ tooltip: Intl.formatMessage({ id: 'vault.loginUri' }) }}>
                    {Intl.formatMessage({ id: 'vault.loginUri' })}
                </Text>
            ),
            dataIndex: 'loginUri',
            ellipsis: false,
            render: (dom) => {
                const tooltipEnable = useRef(false);
                const [tooltipVisible, setTooltipVisible] = useState(false);
                const [maxWidth, setMaxWidth] = useState(250);

                useEffect(() => {
                    let width = 250;
                    const len = dom!.toString().length;
                    if (len > 400) {
                        width = Math.floor(len * 0.65);
                    }
                    setMaxWidth(width);
                }, [dom]);

                const onEllipsis = (ellipsis: boolean) => {
                    tooltipEnable.current = ellipsis;
                };
                return (
                    <>
                        <div
                            onMouseEnter={() => setTooltipVisible(true)}
                            onMouseLeave={() => setTooltipVisible(false)}
                        >
                            {tooltipEnable.current ? (
                                <Tooltip
                                    placement="topLeft"
                                    visible={tooltipVisible}
                                    title={dom}
                                    overlayStyle={{ maxWidth: maxWidth }}
                                >
                                    <span style={{ position: 'absolute', top: 25 }}></span>
                                </Tooltip>
                            ) : (
                                <></>
                            )}
                            <Typography.Text ellipsis={{ onEllipsis: onEllipsis }}>
                                {dom}
                            </Typography.Text>
                        </div>
                    </>
                );
            },
        },
        {
            title: '',
            width: 130,
            render: (_, record) => {
                const deleteItem = async (e: Event) => {
                    e.stopPropagation();
                    const res = await deleteLogin(record.id);
                    if (!res.fail) {
                        getData();
                        message.success(Intl.formatMessage({ id: 'common.delete.success' }));
                    }
                };

                const edit = () => {
                    setVisible(true);
                    setId(record.id);
                    setStatus('edit');
                };

                return (
                    <Actions
                        display={record.id == currentId}
                        containerId={record.containerId}
                        recordId={record.id}
                        edit={edit}
                        deleteItem={deleteItem}
                    />
                );
            },
        },
    ];

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
        const res = await getItems(0);
        if (res.fail) {
            errHandlers.default(res);
        } else {
            const data = res.payload;
            if (data) {
                const tmp: VaultItem[] = [];
                data.forEach((item) => {
                    tmp.push({ ...item, loginUri: item.detail.loginUri });
                });

                dataList.current = tmp;
            }
        }

        setLoading(false);
        handleSearch();

        //sync list to plugin
        syncItemListToPlugin();
    };

    const handleSearch = () => {
        const data = filterData(
            dataList.current,
            ['name', 'description', 'tagNames', 'loginUri'],
            searchData.current,
        );
        setDataSource(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        searchData.current = e.target.value;
        handleSearch();
    };

    const handleAdd = () => {
        setVisible(true);
        setId(0);
        setStatus('new');
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const exportCsv = async () => {
        setImportLoading(true);
        try {
            const createCsvWriter = csvWriter.createObjectCsvStringifier;
            const writer = createCsvWriter({
                header: [
                    { id: 'name', title: CsvFields.name },
                    { id: 'userName', title: CsvFields.userName },
                    { id: 'password', title: CsvFields.password },
                    { id: 'url', title: CsvFields.url },
                ],
            });

            let data: {}[] = [];
            let cryptoService = new TCryptoService();
            for (const record of dataSource) {
                let row = {};
                row['name'] = record.name;
                row['userName'] = record.detail.loginUser;
                row['password'] = await cryptoService.decryptText(
                    record.detail.loginPassword,
                    false,
                );
                row['url'] = record.detail.loginUri;
                data.push(row);
            }
            const content = `${utf8BOM}${writer.getHeaderString()}${writer.stringifyRecords(data)}`;
            let fileName = `Login-${moment().format('YYYYMMDD')}.csv`;
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
                <HubButton onClick={handleAdd} width={70}>
                    {'+ ' + Intl.formatMessage({ id: 'pages.searchTable.new' })}
                </HubButton>
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
                    <ProTable<VaultItem>
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
                                onClick: (event) => {
                                    const target = event.target;
                                    if (
                                        target.cellIndex != 3 &&
                                        target.className != 'ant-progress-inner'
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
                        rowKey="id"
                        search={false}
                        dateFormatter="string"
                        options={{
                            reload: false,
                            density: false,
                            setting: false,
                        }}
                    />
                    <VaultForm
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
