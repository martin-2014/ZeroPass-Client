import { Empty, Divider, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import styles from './index.less';
import { getPendingUsers } from '@/services/api/dashboard';
import * as Users from '@/services/api/userManager';
import { getKeyStore } from '@/models/keyStore';
import moment from 'moment';
import message from '@/utils/message';
import BaseCard from '../BaseCard';
import HubButton from '@/components/HubButton';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { StopFilled } from '@ant-design/icons';

const CountCard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<API.DomainUserItem[]>([]);
    const [haveMore, setHaveMore] = useState<boolean>(false);
    const Intl = useIntl();

    const getData = async () => {
        const res = await getPendingUsers();
        if (!res.fail && res.payload) {
            if (res.payload?.length > 4) {
                setHaveMore(true);
            } else {
                setHaveMore(false);
            }
            const items = res.payload
                .sort((a, b) =>
                    moment.utc(a.createTime).isBefore(moment.utc(b.createTime)) ? 1 : -1,
                )
                .slice(0, 4);
            setData(items);
        } else {
            message.errorIntl(res.errorId);
        }
    };

    const initData = async () => {
        await getData();
        setLoading(false);
    };

    const rejectUser = async (item: API.DomainUserItem) => {
        setLoading(true);
        const res = await Users.approveUser({
            userId: item.id,
            approve: false,
        });
        if (!res.fail) {
            message.success(Intl.formatMessage({ id: 'common.save.success' }));
            await getData();
        } else {
            message.errorIntl(res.errorId);
            await getData();
        }
        setLoading(false);
    };

    const approveUser = async (item: API.DomainUserItem) => {
        setLoading(true);
        var cryptoService = new TCryptoService();
        const sharedKey = await cryptoService.generateSharedKey(item.id);
        if (sharedKey.length == 0) {
            message.error(Intl.formatMessage({ id: 'users.keyShare.failed' }));
            return;
        }
        const res = await Users.approveUser({
            userId: item.id,
            approve: true,
            cipherSharedKey: sharedKey,
        });

        if (!res.fail) {
            message.success(Intl.formatMessage({ id: 'common.save.success' }));
            const keyStore = await getKeyStore();
            const result = await keyStore?.approveUser(item.email);
            if (!result) {
                message.error(Intl.formatMessage({ id: 'users.keyShare.failed' }));
            }
            await getData();
        } else {
            message.errorIntl(res.errorId);
            await getData();
        }
        setLoading(false);
    };

    const moreClick = async (e) => {
        history.push('/workassigned/adminconsole/users');
    };

    useEffect(() => {
        initData();
    }, []);

    const listItem = (item: API.DomainUserItem, shwoLine?: boolean) => {
        if (item) {
            return (
                <div style={{ flex: '0.25', display: 'flex', alignItems: 'center' }} key={item.id}>
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', height: 20 }}>
                            <div style={{ width: 24 }}>
                                <Tooltip
                                    title={Intl.formatMessage({ id: 'overview.invite.reject' })}
                                >
                                    <a
                                        onClick={async (e) => {
                                            await rejectUser(item);
                                        }}
                                    >
                                        <StopFilled
                                            style={{ fontSize: '16px', color: '#F77878' }}
                                        />
                                    </a>
                                </Tooltip>
                            </div>
                            <div style={{ flex: 1, fontSize: 12 }}>{item.email}</div>
                            <div style={{ width: 75 }}>
                                <HubButton
                                    height={20}
                                    style={{
                                        fontSize: '12px',
                                        backgroundColor: '#059dfe',
                                        backgroundImage: 'unset',
                                        maxWidth: 75,
                                    }}
                                    onClick={async (e) => {
                                        await approveUser(item);
                                    }}
                                >
                                    {Intl.formatMessage({ id: 'overview.invite.approve' })}
                                </HubButton>
                            </div>
                        </div>
                        {shwoLine ? <Divider className={styles.divider} /> : <></>}
                    </div>
                </div>
            );
        } else {
            return <></>;
        }
    };

    return (
        <BaseCard
            title={{
                text: <FormattedMessage id="overview.invite.title" />,
                height: 20,
            }}
            radius={8}
            loading={loading}
            suf={
                haveMore ? (
                    <a
                        onClick={moreClick}
                        style={{
                            float: 'right',
                            fontSize: '12px',
                            lineHeight: '12px',
                            margin: '-2px 10px 0 0',
                            color: '#1890ff',
                        }}
                    >
                        <FormattedMessage id="overview.invite.more" />
                    </a>
                ) : (
                    <></>
                )
            }
        >
            {data.length > 0 ? (
                <div className={styles.main}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {data.map((item, index) => listItem(item, data.length !== index + 1))}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', height: '100%', paddingBottom: 10 }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            )}
        </BaseCard>
    );
};

export default CountCard;
