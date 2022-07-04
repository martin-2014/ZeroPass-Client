import { FC } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { getClientState } from '@/services/api/dashboard';
import CountCard from '../CountCard';
import { FormattedMessage } from 'umi';

const MachineCount: FC = () => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        const res = await getClientState();
        if (!res.fail) {
            setCount(res.payload.activeCount + res.payload.inactiveCount);
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
            title={<FormattedMessage id="overview.count.machine" />}
            color="#a77adf"
            count={count}
            href="/workassigned/adminconsole/clients"
            loading={loading}
            iconPath="./icons/machinePurple.svg"
        />
    );
};

export default MachineCount;
