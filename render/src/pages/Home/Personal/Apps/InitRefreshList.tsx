import { useModel } from 'umi';
import { useList } from '@/pages/Home/Context/hooks';
import { useEffect } from 'react';

export default () => {
    const { loadItems } = useList();
    const { refreshLoginList, setRefreshLoginList } = useModel('refreshLoginList');

    const refresh = async () => {
        await loadItems();
        setRefreshLoginList(false);
    };
    useEffect(() => {
        if (refreshLoginList) {
            refresh();
        }
    }, [refreshLoginList]);

    return <></>;
};
