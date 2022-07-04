export type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
};

export type NoticeIconItemType = 'notification' | 'message' | 'event';

export type NoticeIconItem = {
    id: number;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: any;
    title?: JSX.Element;
    datetime?: string;
    description?: JSX.Element;
    actionRequired?: boolean;
};
