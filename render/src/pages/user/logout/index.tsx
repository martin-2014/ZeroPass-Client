import { history } from 'umi';
import useCleanData from '@/hooks/useCleanData';
import { stopAllBrowser } from '@/utils/appBrowser';
import { logoutLocal } from '@/services/api/user';
import { useEffect } from 'react';

const Logout = () => {
    const { cleanDataWhenLogout } = useCleanData();

    useEffect(() => {
        stopAllBrowser();
        cleanDataWhenLogout();
        logoutLocal();
        history.push('/user/login');
    }, []);

    return <></>;
};

export default Logout;
