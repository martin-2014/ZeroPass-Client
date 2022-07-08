import { secretKeyStore } from '@/browserStore/store';
import message from '@/utils/message';
import { LockOutlined } from '@ant-design/icons';
import { Form, Input, Row, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, history, useIntl, useModel } from 'umi';
import styles from './index.less';
import HubButton from '@/components/HubButton';
import MinMaxToolBar from '@/components/RightContent/MinMaxToolBar';
import Photo from '@/components/LeftContent/photo';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';

interface PropsItem {
    visible: boolean;
    callback?: () => void;
}

const Lock = (props: PropsItem) => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const intl = useIntl();
    const { initialState } = useModel('@@initialState');

    useEffect(() => {
        setVisible(props.visible);
    }, [props.visible]);

    const handleSubmit = async (values: API.Login) => {
        setLoading(true);
        const email = initialState?.currentUser?.email;
        if (!email) return;
        const secretKeyVaule = secretKeyStore.getSecretKey(email);
        const cryptoService = new TCryptoService();
        const result = await cryptoService.login(email, values.password, secretKeyVaule!);
        if (!result.fail) {
            setVisible(false);
            form.setFieldsValue({ password: '' });
            props.callback?.();
        } else {
            message.errorIntl('login.unlock.fail', 20001);
        }
        setLoading(false);
    };

    const gotoLogin = () => {
        history.push('/user/logout');
    };

    return (
        <Modal
            centered
            visible={visible}
            footer={null}
            closable={false}
            maskClosable={false}
            keyboard={false}
            className={styles.modal}
            mask={false}
            destroyOnClose={true}
            zIndex={20000}
            getContainer={document.getElementById('root') || document.body}
        >
            <div className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.img}>
                        <img src="./icons/logo.png" />
                    </div>
                    <div className={styles.toolBar}>
                        <MinMaxToolBar />
                    </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.top}></div>
                    <div className={styles.mid}>
                        <div className={styles.img}>
                            <Photo />
                        </div>
                        <div className={styles.username}>{initialState?.currentUser?.email}</div>
                        <div>
                            <Form form={form} onFinish={handleSubmit}>
                                <Form.Item
                                    name="password"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage id="login.password.required" />
                                            ),
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        className={styles.input}
                                        prefix={<LockOutlined className={styles.prefix} />}
                                        type="password"
                                        placeholder={intl.formatMessage({ id: 'login.password' })}
                                        bordered={false}
                                    />
                                </Form.Item>
                                <Row className={styles.submit}>
                                    <HubButton
                                        loadingVisible={loading}
                                        style={{ width: '100%' }}
                                        height={48}
                                        onClick={form.submit}
                                    >
                                        {intl.formatMessage({ id: 'login.unlock' })}
                                    </HubButton>
                                </Row>
                            </Form>
                        </div>
                        <div className={styles.footer}>
                            <a onClick={gotoLogin}>
                                <FormattedMessage id="login.change.account" />
                            </a>
                        </div>
                    </div>
                    <div className={styles.bottom}></div>
                </div>
            </div>
        </Modal>
    );
};

export default Lock;
