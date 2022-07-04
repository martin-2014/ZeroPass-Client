import { FC } from 'react';
import { useState, useEffect } from 'react';
import { getAppState } from '@/services/api/dashboard';
import CountCard from '../CountCard';
import { FormattedMessage } from 'umi';

const AppCount: FC = () => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        const res = await getAppState();
        if (!res.fail) {
            setCount(res.payload.count);
        }
    };

    const initData = async () => {
        getData();
    };

    useEffect(() => {
        initData();
        setLoading(false);
    }, []);

    return (
        <CountCard
            title={<FormattedMessage id="overview.count.app" />}
            color="#009cfe"
            count={count}
            href="/workassigned/adminconsole/entries"
            loading={loading}
            iconPath="./icons/appBlue.svg"
        />
    );
};

export default AppCount;
