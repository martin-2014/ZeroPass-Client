import { Card, Divider, Typography, Tabs } from 'antd';
import { FormattedMessage } from 'umi';
import type { FC } from 'react';
import styles from './index.less';
import MockClient from './Mock';

const { Title } = Typography;
const { TabPane } = Tabs;

const Clients: FC = () => {
    return (
        <Card
            className={styles.main}
            bordered={false}
            bodyStyle={{
                padding: '24px 24px 0 24px',
                height: '100%',
            }}
        >
            <Title level={3}>{<FormattedMessage id="clients.machine" />}</Title>
            <Divider style={{ margin: '5px 0 10px 0' }} />
            <div className="card-container">
                <Tabs defaultActiveKey="1" type="card">
                    <TabPane tab={<FormattedMessage id="clients.mock" />} key="1">
                        <MockClient />
                    </TabPane>
                    <TabPane tab={<FormattedMessage id="clients.physical" />} key="2"></TabPane>
                    <TabPane tab={<FormattedMessage id="clients.cloud" />} key="3"></TabPane>
                </Tabs>
            </div>
        </Card>
    );
};

export default Clients;
