import { history } from 'umi';
import useCleanData from '@/hooks/useCleanData';
import { logoutLocal } from '@/services/api/user';
import { useEffect } from 'react';

const Logout = () => {
    const { cleanDataWhenLogout } = useCleanData();

    useEffect(() => {
        cleanDataWhenLogout();
        logoutLocal();
        history.push('/user/login');
    }, []);

    return <></>;
};

export default Logout;
