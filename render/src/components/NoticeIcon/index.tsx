import { useEffect, useState } from 'react';
import {
    clearNotifications,
    NotificationItem,
    processNotification,
    getActiveNotifications,
} from '@/services/api/notification';
import NoticeIcon from './NoticeIcon';
import styles from './index.less';
import { FormattedMessage, useIntl } from 'umi';
import ActionModal from './ActionModal';
import ActionResultModal from './ActionResultModal';
import { NoticeIconItem } from './NoticeIconTypes';
import { useLocalTimeSimple } from '@/hooks/useLocalTime';
import { NotificationActionProps } from '@/components/NoticeIcon/ActionModal';
import { ButtonType } from 'antd/lib/button';
import { AlertOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { errHandlers } from '@/services/api/errHandlers';
import { acceptInvite, rejectInvite } from '@/services/api/userManager';

const POLLING_INTERVAL_SECS = 60;

type Item = NotificationItem & NoticeIconItem;

const NoticeIconView = () => {
    const [currentNotification, setCurrentNotification] = useState<Item>();
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notifications, setNotifications] = useState<Item[]>([]);
    const [actionVisible, setActionVisible] = useState(false);
    const [actionResultVisible, setActionResultVisible] = useState(false);
    const [loadingNotification, setLoadingNotification] = useState(false);
    const [actionResult, setActionResult] =
        useState<{ title: JSX.Element; message: JSX.Element }>();

    const getLocalTime = useLocalTimeSimple();
    const Intl = useIntl();

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(() => {
            loadNotifications();
        }, POLLING_INTERVAL_SECS * 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const transformNotification = (item: NotificationItem): Item => {
        let result: NoticeIconItem = {
            key: item.id.toString(),
            id: item.id,
            datetime: getLocalTime(item.createTime),
            read: false,
        };
        switch (item.type) {
            case 'InvitationReceived': {
                const body = item.body as {
                    companyName: string;
                    domainId: number;
                    domainName: string;
                };
                result = {
                    ...result,
                    title: (
                        <FormattedMessage id="notification.invitation.received.title"></FormattedMessage>
                    ),
                    actionRequired: true,
                    description: (
                        <FormattedMessage
                            id="notification.invitation.received.message"
                            values={{ domainName: body.domainName, companyName: body.companyName }}
                        ></FormattedMessage>
                    ),
                };
                break;
            }
            case 'InvitationAccepted': {
                const body = item.body as {
                    userEmail: string;
                    userId: number;
                    domainName: string;
                    companyName: string;
                };
                result = {
                    ...result,
                    title: (
                        <FormattedMessage id="notification.joindomain.pending.title"></FormattedMessage>
                    ),
                    description: (
                        <FormattedMessage
                            id="notification.joindomain.pending.message"
                            values={{
                                userEmail: body.userEmail,
                                domainName: body.domainName,
                                companyName: body.companyName,
                            }}
                        ></FormattedMessage>
                    ),
                };
                break;
            }
            case 'InvitationRejected': {
                const body = item.body as {
                    userEmail: string;
                    domainName: string;
                    companyName: string;
                };
                result = {
                    ...result,
                    title: (
                        <FormattedMessage id="notification.invitation.rejected.title"></FormattedMessage>
                    ),
                    description: (
                        <FormattedMessage
                            id="notification.invitation.rejected.message"
                            values={{
                                userEmail: body.userEmail,
                                domainName: body.domainName,
                                companyName: body.companyName,
                            }}
                        ></FormattedMessage>
                    ),
                };
                break;
            }
            case 'UserJoinApproved': {
                const body = item.body as { domainName: string; companyName: string };
                result = {
                    ...result,
                    title: (
                        <FormattedMessage id="notification.joindomain.approved.title"></FormattedMessage>
                    ),
                    description: (
                        <FormattedMessage
                            id="notification.joindomain.approved.message"
                            values={{ domainName: body.domainName, companyName: body.companyName }}
                        ></FormattedMessage>
                    ),
                };
                break;
            }
            case 'UserJoinRejected': {
                const body = item.body as { domainName: string; companyName: string };
                result = {
                    ...result,
                    title: (
                        <FormattedMessage id="notification.joindomain.rejected.title"></FormattedMessage>
                    ),
                    description: (
                        <FormattedMessage
                            id="notification.joindomain.rejected.message"
                            values={{ domainName: body.domainName, companyName: body.companyName }}
                        ></FormattedMessage>
                    ),
                };
                break;
            }
        }
        result.avatar = result.actionRequired ? <AlertOutlined /> : <InfoCircleOutlined />;
        return { ...item, ...result };
    };

    const transformAction = (item: NotificationItem, allItems: NotificationItem[]) => {
        switch (item.type) {
            case 'InvitationReceived': {
                return transformActionForInvitationReceived(item, allItems);
            }
            default:
                return undefined;
        }
    };

    const findAllDuplicate = (item: NotificationItem, allItems: NotificationItem[]) => {
        return allItems
            .filter(
                (i) =>
                    i.type === item.type &&
                    i.status === item.status &&
                    JSON.stringify(i.body) === JSON.stringify(item.body),
            )
            .map((i) => i.id);
    };

    const removeFromList = (ids: number[]) => {
        setNotifications((pre) => pre.filter((n) => !ids.find((id) => id === n.id)));
    };

    const showActionResult = (title: JSX.Element, message: JSX.Element) => {
        setActionResult({ title, message });
        setActionResultVisible(true);
    };

    const transformActionForInvitationReceived = (
        item: NotificationItem,
        allItems: NotificationItem[],
    ): NotificationActionProps => {
        const body = item.body as { companyName: string; domainId: number; domainName: string };
        const result = {
            actionTitle: <FormattedMessage id="component.invitation.title"></FormattedMessage>,
            actionBody: (
                <FormattedMessage
                    id="component.invitation.message"
                    values={{ domainName: body.domainName, company: body.companyName }}
                ></FormattedMessage>
            ),
            firstButton: {
                text: Intl.formatMessage({ id: 'component.invitation.ignore' }),
            },
            firstButtonClick: () => {
                setActionVisible(false);
                return Promise.resolve();
            },
            secondButton: {
                style: { color: 'red', borderColor: 'red' },
                text: Intl.formatMessage({ id: 'component.invitation.reject' }),
            },
            secondButtonClick: async () => {
                setActionVisible(false);
                const res = await rejectInvite({ domainId: body.domainId });
                if (res.fail) {
                    errHandlers.default(res);
                    return;
                }
                const ids = findAllDuplicate(item, allItems);
                removeFromList(ids);
                await processNotification({ ids: ids, result: { type: 'reject' } });
            },
            thirdButton: {
                type: 'primary' as ButtonType,
                showLoading: true,
                text: Intl.formatMessage({ id: 'component.invitation.accept' }),
            },
            thirdButtonClick: async () => {
                const res = await acceptInvite(body.domainId);
                setActionVisible(false);
                if (res.fail) {
                    errHandlers.default(res);
                    return;
                }
                const ids = findAllDuplicate(item, allItems);
                removeFromList(ids);
                await processNotification({ ids: ids, result: { type: 'accept' } });
                showActionResult(
                    <FormattedMessage id="component.invitation.title"></FormattedMessage>,
                    <FormattedMessage
                        id="component.invitation.accpet.success"
                        values={{ domainName: body.domainName }}
                    ></FormattedMessage>,
                );
            },
        };
        return result;
    };

    const loadNotifications = async () => {
        setLoadingNotification(true);
        const res = await getActiveNotifications();
        if (!res.skip && !res.fail) {
            let newNotifications = res.payload?.map((item) => transformNotification(item)) || [];
            setNotifications((oldNotifications) => {
                newNotifications = newNotifications.filter(
                    (newNotification) =>
                        !oldNotifications.find((old) => old.id === newNotification.id),
                );
                return [...newNotifications, ...oldNotifications];
            });
        }
        setLoadingNotification(false);
    };

    const handleItemClick = (id: number) => {
        const item = notifications.find((n) => n.id === id);
        if (!item) return;
        if (item.actionRequired) {
            setNotificationVisible(false);
            setCurrentNotification(item);
            setActionVisible(true);
        } else {
            setReaded(id);
            clearNotifications({ ids: [id] });
        }
    };

    const setReaded = (id: number) => {
        const newNotifications = notifications.map((n) => {
            if (n.id === id) {
                return { ...n, read: true };
            } else {
                return { ...n };
            }
        });
        setNotifications(newNotifications);
    };

    useEffect(() => {
        if (!notificationVisible) {
            const readedIds = notifications.filter((n) => n.read === true).map((n) => n.id);
            if (readedIds.length > 0) {
                clearNotifications({ ids: readedIds });
            }
            const unreaded = notifications.filter((n) => n.read !== true);
            setNotifications(unreaded);
        }
    }, [notificationVisible]);

    const handleVisibleChange = (visible: boolean) => {
        setNotificationVisible(visible);
    };

    const handleClear = async () => {
        const copy = [...notifications];
        setNotifications([]);
        const values = { ids: copy.map((item) => item.id) };
        await clearNotifications(values);
    };

    const countUnreaded = () => {
        return notifications.reduce((pre, cur) => (cur.read === true ? pre : pre + 1), 0);
    };

    return (
        <>
            <NoticeIcon
                className={styles.action}
                count={countUnreaded()}
                onItemClick={(item) => {
                    handleItemClick(item.id);
                }}
                onClear={() => handleClear()}
                loading={loadingNotification}
                clearText={<FormattedMessage id="notification.clear"></FormattedMessage>}
                clearClose
                onPopupVisibleChange={handleVisibleChange}
                popupVisible={notificationVisible}
            >
                <NoticeIcon.Tab
                    tabKey="notification"
                    count={notifications?.length}
                    list={notifications}
                    title={
                        countUnreaded() > 0 ? (
                            <FormattedMessage
                                id="notification.title.count"
                                values={{ messageCount: countUnreaded() }}
                            ></FormattedMessage>
                        ) : (
                            <FormattedMessage id="notification.title"></FormattedMessage>
                        )
                    }
                    showClear={true}
                    showViewMore={false}
                />
            </NoticeIcon>
            {currentNotification ? (
                <>
                    <ActionModal
                        visible={actionVisible}
                        notification={transformAction(currentNotification!, notifications)}
                        onClose={() => setActionVisible(false)}
                    ></ActionModal>
                    <ActionResultModal
                        visible={actionResultVisible}
                        title={actionResult?.title}
                        message={actionResult?.message}
                        onClose={() => setActionResultVisible(false)}
                    ></ActionResultModal>
                </>
            ) : (
                <></>
            )}
        </>
    );
};

export default NoticeIconView;
