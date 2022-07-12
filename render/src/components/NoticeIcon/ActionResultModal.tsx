import { useIntl } from 'umi';
import { Row, Col, Space } from 'antd';
import SimpleModal from '@/components/SimpleModal';
import HubButton from '@/components/HubButton';
import { CheckCircleOutlined } from '@ant-design/icons';

interface PropsItem {
    title?: JSX.Element;
    message?: JSX.Element;
    visible: boolean;
    onClose: () => void;
}

export default (props: PropsItem) => {
    const Intl = useIntl();

    return (
        <SimpleModal
            width={500}
            close={props.onClose}
            visible={props.visible}
            closable
            destroyOnClose
            title={props.title}
            footer={
                <Space>
                    <HubButton width={75} type="primary" onClick={props.onClose}>
                        {Intl.formatMessage({ id: 'common.ok' })}
                    </HubButton>
                </Space>
            }
        >
            <Row style={{ margin: '10px  0 0 0' }}>
                <Col span="4">
                    <CheckCircleOutlined style={{ fontSize: '60px', color: '#009AFF' }} />
                </Col>
                <Col span="20">{props.message}</Col>
            </Row>
        </SimpleModal>
    );
};
