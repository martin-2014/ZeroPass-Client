import { useEffect, useState } from 'react';
import {
    clearNotifications,
    processNotification,
    getActiveNotifications,
    NotificationItem,
} from '@/services/api/notification';
import { useLocalTimeSimple } from '@/hooks/useLocalTime';
import NoticeIcon from './NoticeIcon';
import styles from './index.less';
import { FormattedMessage, useModel } from 'umi';
import { acceptInvite, rejectInvite } from '@/services/api/userManager';
import ActionModal, { NotificationActionProps } from './ActionModal';
import ActionResultModal from './ActionResultModal';
import { ButtonType } from 'antd/lib/button';
import { AlertOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { NoticeIconItem } from './NoticeIconTypes';
import { errHandlers } from '@/services/api/errHandlers';
import Lock from '@/pages/Lock';
import { sessionStore } from '@/browserStore/store';

const POLLING_INTERVAL_SECS = 60;

type Item = NotificationItem & NoticeIconItem;

let Timing = 0;
let LockInterval: NodeJS.Timer | undefined;

const NoticeIconView = () => {
    const [notifications, setNotifications] = useState<Item[]>([]);
    const [currentNotification, setCurrentNotification] = useState<Item>();
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [loadingNotification, setLoadingNotification] = useState(false);
    const [actionVisible, setActionVisible] = useState(false);
    const [actionResultVisible, setActionResultVisible] = useState(false);
    const [actionResult, setActionResult] =
        useState<{ title: JSX.Element; message: JSX.Element }>();
    const getLocalTime = useLocalTimeSimple();

    const [showLock, setShowLock] = useState(false);
    const { lock } = useModel('autoLock');
    const { initialState } = useModel('@@initialState');

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
                text: <FormattedMessage id="component.invitation.ignore"></FormattedMessage>,
            },
            firstButtonClick: () => {
                setActionVisible(false);
                return Promise.resolve();
            },
            secondButton: {
                style: { color: 'red', borderColor: 'red' },
                text: <FormattedMessage id="component.invitation.reject"></FormattedMessage>,
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
                text: <FormattedMessage id="component.invitation.accept"></FormattedMessage>,
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
                        id="users.invite.accpet.success"
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

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(() => {
            loadNotifications();
        }, POLLING_INTERVAL_SECS * 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

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

    const removeFromList = (ids: number[]) => {
        setNotifications((pre) => pre.filter((n) => !ids.find((id) => id === n.id)));
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

    const showActionResult = (title: JSX.Element, message: JSX.Element) => {
        setActionResult({ title, message });
        setActionResultVisible(true);
    };

    const startLock = (interval: number) => {
        if (!LockInterval) {
            LockInterval = setInterval(() => {
                if (!showLock) {
                    if (Timing >= interval) {
                        setShowLock(true);
                        updateExtensionUserProfile(true);
                        Timing = 0;
                        return;
                    }
                    Timing += 1;
                }
            }, 1000);
        }
    };

    const resetTiming = () => {
        Timing = 0;
    };

    const restartTiming = () => {
        setShowLock(false);
        updateExtensionUserProfile(false);
        Timing = 0;
    };

    const updateExtensionUserProfile = (isLocked: boolean) => {
        sessionStore.lock = isLocked.toString();
        initialState?.fetchUserInfo();
    };

    useEffect(() => {
        window.electron.extensionHeartbeat(resetTiming);

        window.addEventListener('click', resetTiming);
        window.addEventListener('mousemove', resetTiming);

        return () => {
            window.removeEventListener('click', resetTiming);
            window.removeEventListener('mousemove', resetTiming);
            if (LockInterval) {
                clearInterval(LockInterval);
                LockInterval = undefined;
                Timing = 0;
            }
        };
    }, []);

    useEffect(() => {
        if (LockInterval) {
            clearInterval(LockInterval);
            LockInterval = undefined;
        }

        if (lock !== 0) {
            startLock(lock);
        }
    }, [lock]);

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
            <Lock visible={showLock} callback={restartTiming} />
        </>
    );
};

export default NoticeIconView;
