import { Card, Typography, List, Button, Skeleton, Empty } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import { useEffect } from 'react';
import { FormattedMessage, useModel } from 'umi';
import styles from './index.less';
import { useLocalTime } from '@/hooks/useLocalTime';
import BaseCard from '../BaseCard';

const { Text } = Typography;

const PasswordMon = () => {
    const { theme } = useModel('theme');

    const getlocalTime = useLocalTime();

    const list = [];

    useEffect(() => {}, []);

    return (
        <BaseCard
            title={{
                text: <FormattedMessage id="overview.password.title" />,
                height: 20,
            }}
            radius={8}
            loading={false}
        >
            {/* <div className={styles.main}>
                <List
                itemLayout='horizontal'
                dataSource={list}
                renderItem={item => (
                    <List.Item style={{padding: '5px 0'}}>
                        <Skeleton avatar title={false} loading={false} active>
                            <List.Item.Meta
                            avatar={<a onClick={async (e) =>{}}><Avatar src='./icons/rejectRed.svg' shape='square' /></a>}
                            title={item.email}
                            description={getlocalTime(item.createTime)}
                            />
                            <Button onClick={async (e) => {}} style={{borderRadius: '5px', backgroundColor: '#019cfe', color: 'white'}}><FormattedMessage id='overview.invite.approve' /></Button>
                        </Skeleton>
                    </List.Item>
                )}
                />
          </div> */}

            <div
                style={{
                    display: 'flex',
                    fontSize: 32,
                    opacity: '0.3',
                    height: '100%',
                    paddingBottom: 10,
                }}
            >
                <div style={{ margin: 'auto' }}>
                    <FormattedMessage id="common.comming.tips" />
                </div>
            </div>
        </BaseCard>
    );
};

export default PasswordMon;
