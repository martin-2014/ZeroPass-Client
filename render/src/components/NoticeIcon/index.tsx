import { useEffect, useState } from 'react';
import {
    clearNotifications,
    getActiveNotifications,
    NotificationItem,
} from '@/services/api/notification';
import NoticeIcon from './NoticeIcon';
import styles from './index.less';
import { FormattedMessage, useModel } from 'umi';
import ActionModal from './ActionModal';
import ActionResultModal from './ActionResultModal';
import { NoticeIconItem } from './NoticeIconTypes';
import Lock from '@/pages/Lock';
import { sessionStore } from '@/browserStore/store';
import useNotice from '@/components/NoticeIcon/useNotice';

const POLLING_INTERVAL_SECS = 60;

type Item = NotificationItem & NoticeIconItem;

let Timing = 0;
let LockInterval: NodeJS.Timer | undefined;

const NoticeIconView = () => {
    const [currentNotification, setCurrentNotification] = useState<Item>();
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [loadingNotification, setLoadingNotification] = useState(false);

    const [showLock, setShowLock] = useState(false);
    const { lock } = useModel('autoLock');
    const { initialState } = useModel('@@initialState');

    const {
        actionVisible,
        setActionVisible,
        notifications,
        setNotifications,
        actionResult,
        actionResultVisible,
        setActionResultVisible,
        transformNotification,
        transformAction,
    } = useNotice();

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

    const startLock = () => {
        if (Timing >= lock) {
            setShowLock(true);
            updateExtensionUserProfile(true);
            Timing = 0;
            return;
        }
        Timing += 1;
        LockInterval = setTimeout(startLock, 1000);
    };

    const resetTiming = () => {
        Timing = 0;
    };

    const restartTiming = () => {
        setShowLock(false);
        updateExtensionUserProfile(false);
        startLock();
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
            startLock();
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
