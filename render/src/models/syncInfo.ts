import useTagList from '@/hooks/useTagList';
import { useState } from 'react';

const syncInfo = () => {
    const [syncInfo, setInfo] = useState<Message.SyncInfoData>();
    const { setNewTag } = useTagList();

    const setSyncInfo = (info: Message.SyncInfoData) => {
        if (info.status === 'done' && info.status !== syncInfo?.status) {
            setNewTag('personal');
        }
        setInfo(info);
    };
    return { syncInfo, setSyncInfo };
};

export default syncInfo;
