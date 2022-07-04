import { onceExecutor, requester } from './requester';

export type NotificationType =
    | 'InvitationReceived'
    | 'InvitationAccepted'
    | 'InvitationRejected'
    | 'UserJoinApproved'
    | 'UserJoinRejected';

export type NotificationStatus = 'Created' | 'Processed';
export type NotificationItem = {
    id: number;
    user_id: number;
    body: any;
    type: NotificationType;
    status: NotificationStatus;
    createTime: string;
    updateTime?: string;
};

const executor = onceExecutor();
export const getActiveNotifications = () => {
    return executor(() => requester.get<NotificationItem[]>('/api/notifications/active'));
};

export const clearNotifications = (payload: { ids: number[] }) => {
    return requester.post('/api/notifications/clear', payload);
};

export const processNotification = (payload: { ids: number[]; result: {} }) => {
    return requester.post('/api/notifications/process', payload);
};
