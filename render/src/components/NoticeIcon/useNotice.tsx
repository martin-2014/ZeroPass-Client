import { useState } from 'react';
import { NotificationItem } from '@/services/api/notification';
import { useLocalTimeSimple } from '@/hooks/useLocalTime';
import { AlertOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { NoticeIconItem } from './NoticeIconTypes';

type Item = NotificationItem & NoticeIconItem;

export default () => {
    const [notifications, setNotifications] = useState<Item[]>([]);
    const [actionVisible, setActionVisible] = useState(false);
    const [actionResultVisible, setActionResultVisible] = useState(false);
    const [actionResult, setActionResult] =
        useState<{ title: JSX.Element; message: JSX.Element }>();
    const getLocalTime = useLocalTimeSimple();

    const transformNotification = (item: NotificationItem): Item => {
        let result: NoticeIconItem = {
            key: item.id.toString(),
            id: item.id,
            datetime: getLocalTime(item.createTime),
            read: false,
        };
        result.avatar = result.actionRequired ? <AlertOutlined /> : <InfoCircleOutlined />;
        return { ...item, ...result };
    };

    const transformAction = (item: NotificationItem, allItems: NotificationItem[]) => {
        return undefined;
    };

    return {
        actionVisible,
        setActionVisible,
        notifications,
        setNotifications,
        actionResult,
        setActionResult,
        actionResultVisible,
        setActionResultVisible,
        transformNotification,
        transformAction,
    };
};
