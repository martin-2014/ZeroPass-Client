import {
    getMergeStatus,
    getPersonalCid,
    isSyncing,
    mergeData,
} from '@/services/api/synchronization';
import styles from './index.less';
import HubButton from '../HubButton';
import { Typography, Space, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import {
    SyncOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    ExclamationCircleFilled,
} from '@ant-design/icons';
import { FormattedMessage, useModel, useIntl } from 'umi';
import message from '@/utils/message';
import { OpenUrlByBrowser } from '@/utils/tools';
import { sessionStore } from '@/browserStore/store';
import { Copy, Share } from '@icon-park/react';
import HubAlert from '@/components/HubAlert';

const { Title, Text } = Typography;

const SyncStatus = (props: { close: () => void }) => {
    let checkSyncStatus: NodeJS.Timeout | undefined;
    const [enableSyncButton, setEnableSyncButton] = useState<boolean>(true);
    const { initialState } = useModel('@@initialState');
    const [lastMessage, setLastMessage] = useState<string>('');
    const [displayInfo, setDisplayInfo] = useState<boolean>(false);
    const Intl = useIntl();
    const syncingRef = useRef(false);
    const { syncInfo } = useModel('syncInfo');

    const CompletedIcon = () => {
        return <CheckCircleFilled style={{ color: '#21abdf', fontSize: '50px' }} />;
    };

    const ErrorIcon = () => {
        return <CloseCircleFilled style={{ color: '#db2f2f', fontSize: '50px' }} />;
    };

    const NeverRunIcon = () => {
        return <ExclamationCircleFilled style={{ color: '#dbd318', fontSize: '50px' }} />;
    };

    const RunningIcon = () => {
        return <SyncOutlined style={{ color: '#ffa809', fontSize: '50px' }} spin={true} />;
    };

    const StatusIcon = () => {
        let ele = <CompletedIcon />;
        if (curSyncStatus !== 'normal') {
            if (curSyncStatus === 'timeout' || curSyncStatus === 'error') {
                ele = <ErrorIcon />;
            } else if (curSyncStatus === 'done') {
                ele = <CompletedIcon />;
            } else {
                ele = <RunningIcon />;
            }
        } else {
            if (lastSyncResult === 'successfully') {
                ele = <CompletedIcon />;
            } else if (lastSyncResult === 'failed' || lastSyncResult === 'timeout') {
                ele = <CompletedIcon />;
            } else {
                ele = <NeverRunIcon />;
            }
        }

        return ele;
    };

    const SyncStatusInfo = (ssiProps: { syncing: boolean; syncType?: Message.SyncType }) => {
        if (ssiProps.syncing) {
            return (
                <Text>
                    <FormattedMessage id="sync.status.via" />{' '}
                    {ssiProps.syncType == 'ipfs' ? 'IPFS' : 'Google'}
                </Text>
            );
        } else {
            return <FormattedMessage id="sync.status.idle" />;
        }
    };

    const onSync = async () => {
        setEnableSyncButton(false);
        const syncConfig = initialState!.currentUser!.setting!.sync;
        if (syncConfig?.enable) {
            const res = await mergeData({
                type: syncConfig.type as Message.SyncType,
                id: initialState!.currentUser!.id,
                method: 'manual',
            });
            if (res.fail && res.errorId) {
                message.errorIntl(res.errorId);
            }
        }
    };

    const getSyncData = async () => {
        //IPFS
        const res = await getPersonalCid();
        if (!res.fail) {
            const cid = res.payload?.cid ?? '';
            setLastMessage(cid);
            setDisplayInfo(cid != '');
        }
    };
    const syncConfig = initialState!.currentUser!.setting!.sync;
    let lastSyncTime: number;
    let lastSyncResult: Message.SyncStatus;
    let curSyncStatus: string;
    let lastSyncType: Message.SyncType;
    let curSyncType: Message.SyncType;
    let errorId: string | undefined = undefined;
    if (syncConfig?.enable && syncInfo) {
        lastSyncTime = syncInfo.lastSyncInfo?.endTime;
        const _syncing = isSyncing(syncInfo.status);
        if (_syncing !== syncingRef.current) {
            getSyncData();
        }
        syncingRef.current = _syncing;
        lastSyncResult = syncInfo.lastSyncInfo?.status;
        curSyncStatus = syncInfo.status;
        lastSyncType = syncInfo.lastSyncInfo?.type;
        curSyncType = syncInfo.type;
        errorId = syncInfo.errorId;
    }
    const syncing = syncingRef.current;
    useEffect(() => {
        if (!syncing && !enableSyncButton) {
            setEnableSyncButton(true);
        }
    }, [syncing, enableSyncButton]);

    useEffect(() => {
        getSyncData();
        return () => {
            if (checkSyncStatus) {
                checkSyncStatus = undefined;
            }
        };
    }, []);

    return (
        <div className={styles.main} style={{ textAlign: 'left', width: '100%' }}>
            <div style={{ width: '100%', gap: 8, display: 'flex' }}>
                <div>
                    <StatusIcon />
                </div>
                <div style={{ width: '100%' }}>
                    <div>
                        <Text>
                            <FormattedMessage id="sync.label.status" />:{' '}
                        </Text>
                        <SyncStatusInfo syncing={syncing} syncType={curSyncType} />
                    </div>
                    <div>
                        <Text>
                            <FormattedMessage id="sync.label.lastSync" />:{' '}
                        </Text>
                        {lastSyncTime !== undefined ? (
                            <Text>
                                {lastSyncResult == 'successfully' ? (
                                    <FormattedMessage id="sync.message.succAt" />
                                ) : (
                                    <FormattedMessage id="sync.message.failedAt" />
                                )}{' '}
                                {new Date(lastSyncTime).toLocaleString(undefined, {
                                    hour12: false,
                                })}
                            </Text>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div>
                        <Text>
                            <FormattedMessage id="sync.label.nextSync" />:{' '}
                        </Text>
                        <Text>
                            <FormattedMessage id="sync.message.scheduledAt" />{' '}
                            {new Date(sessionStore.nextSyncTime).toLocaleString(undefined, {
                                hour12: false,
                            })}
                        </Text>
                    </div>
                    <Space>
                        {errorId !== undefined ? (
                            <HubAlert
                                fontSize={14}
                                type="error"
                                msg={Intl.formatMessage({ id: errorId })}
                            />
                        ) : (
                            ''
                        )}
                        {errorId == 'err_data_sync_lock_failed' ||
                        errorId == 'err_data_sync_upload_failed' ? (
                            <div style={{ color: '#ff4d4f' }}>
                                <FormattedMessage id="sync.message.tryLater" />
                            </div>
                        ) : (
                            ''
                        )}
                    </Space>
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <Space style={{ margin: 'auto' }}>
                    <HubButton
                        onClick={(e) => props.close()}
                        style={{ marginTop: '20px', width: '100px' }}
                        type="default"
                    >
                        {Intl.formatMessage({ id: 'sync.button.close' })}
                    </HubButton>
                    <HubButton
                        onClick={onSync}
                        disable={syncing}
                        style={{ marginTop: '20px', width: '100px' }}
                    >
                        {Intl.formatMessage({ id: 'sync.button.sync' })}
                    </HubButton>
                </Space>
            </div>
            <div style={{ display: displayInfo ? 'block' : 'none' }}>
                <div style={{ marginTop: '20px' }}>
                    <Text style={{ display: lastSyncType == 'ipfs' ? '' : 'none' }}>
                        <FormattedMessage id="sync.message.lastCopy" />:{' '}
                    </Text>
                    <Text>
                        {lastSyncType == 'ipfs' ? (
                            <Space>
                                CID = {lastMessage}{' '}
                                <Tooltip title={Intl.formatMessage({ id: 'common.copy' })}>
                                    <Copy
                                        className={'zp-icon'}
                                        onClick={(e) => navigator.clipboard.writeText(lastMessage)}
                                        size={18}
                                    />
                                </Tooltip>
                                <Tooltip title={Intl.formatMessage({ id: 'common.menu.open' })}>
                                    <Share
                                        onClick={(e) =>
                                            OpenUrlByBrowser.default(
                                                `https://dweb.link/ipfs/${lastMessage}`,
                                            )
                                        }
                                        className={'zp-icon'}
                                        size={18}
                                    />
                                </Tooltip>
                            </Space>
                        ) : (
                            ''
                        )}
                    </Text>
                </div>
                <div>
                    <Text>
                        {lastSyncType == 'ipfs' ? (
                            <FormattedMessage id="sync.message.ipfs.statement" />
                        ) : (
                            ''
                        )}
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default SyncStatus;
