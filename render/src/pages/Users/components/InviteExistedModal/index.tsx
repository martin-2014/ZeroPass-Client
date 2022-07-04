import { FormattedMessage, useIntl } from 'umi';
import { Row, Col, List, Typography } from 'antd';
import { useState, useEffect } from 'react';
import SimpleModal from '@/components/SimpleModal';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import HubButton from '@/components/HubButton';

const { Text } = Typography;

interface PropsItem {
    visible: boolean;
    close?: () => void;
    emails: string[];
    ownerEmails: string[];
}

const InviteExistedUser = (props: PropsItem) => {
    const [visible, setVisible] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);
    const [ownerEmails, setOwnerEmails] = useState<string[]>([]);
    const [hideExistedEmails, setHideExistedEmails] = useState<boolean>(false);
    const [hideOwnerEmails, setHideOwnerEmails] = useState<boolean>(false);
    const Intl = useIntl();

    const close = () => {
        if (props.close) {
            props.close();
        } else {
            setVisible(false);
        }
    };

    useEffect(() => {
        setVisible(props.visible);
        if (props.emails.length == 0) {
            setHideExistedEmails(true);
        } else {
            setHideExistedEmails(false);
        }
        if (props.ownerEmails.length == 0) {
            setHideOwnerEmails(true);
        } else {
            setHideOwnerEmails(false);
        }
        setEmails(props.emails);
        setOwnerEmails(props.ownerEmails);
    }, [props.emails, props.visible, props.ownerEmails]);

    return (
        <SimpleModal
            visible={visible}
            close={close}
            width={500}
            title={Intl.formatMessage({ id: 'users.invite.title' })}
            closable
            footer={
                <div>
                    <HubButton style={{ margin: 'auto' }} width={85} type="primary" onClick={close}>
                        {Intl.formatMessage({ id: 'common.ok' })}
                    </HubButton>
                </div>
            }
        >
            <Row>
                <Col span={5} style={{ textAlign: 'center' }}>
                    <ExclamationCircleOutlined
                        style={{ fontSize: '64px', color: '#009AFF', marginLeft: -10 }}
                    />
                </Col>
                <Col span={19}>
                    <FormattedMessage id="users.invite.existedMessage" />
                    <div style={{ display: hideExistedEmails ? 'none' : '' }}>
                        <Text>
                            <FormattedMessage id="users.invite.existedEmails" />
                        </Text>
                        <List
                            dataSource={emails}
                            itemLayout="horizontal"
                            renderItem={(item) => (
                                <List.Item style={{ border: 'none', padding: '5px 0' }}>
                                    <Text strong={true}>{item}</Text>
                                </List.Item>
                            )}
                        />
                    </div>
                    <div style={{ display: hideOwnerEmails ? 'none' : '' }}>
                        <Text>
                            <FormattedMessage id="users.invite.ownerEmails" />
                        </Text>
                        <List
                            dataSource={ownerEmails}
                            itemLayout="horizontal"
                            renderItem={(item) => (
                                <List.Item style={{ border: 'none', padding: '5px 0' }}>
                                    <Text strong={true}>{item}</Text>
                                </List.Item>
                            )}
                        />
                    </div>
                </Col>
            </Row>
        </SimpleModal>
    );
};

export default InviteExistedUser;
