import { FC } from 'react';
import { useState, useEffect } from 'react';
import { getUserState } from '@/services/api/dashboard';
import CountCard from '../CountCard';
import { FormattedMessage } from 'umi';

const UserCount: FC = () => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        const res = await getUserState();
        if (!res.fail) {
            setCount(
                res.payload.activeCount + res.payload.inactiveCount + res.payload.pendingCount,
            );
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
            title={<FormattedMessage id="overview.count.user" />}
            color="#fc5e5e"
            count={count}
            href="/workassigned/adminconsole/users"
            loading={loading}
            iconPath="./icons/userRed.svg"
        />
    );
};

export default UserCount;
