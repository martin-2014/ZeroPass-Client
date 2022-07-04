import { localStore, secretKeyStore, sessionStore } from '@/browserStore/store';
import useInitData from '@/hooks/useInitData';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { currentUser as queryCurrentUser, switchDomain } from '@/services/api/user';
import message from '@/utils/message';
import { LockOutlined } from '@ant-design/icons';
import { Form, Input, Row, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, history, useIntl, useModel } from 'umi';
import styles from './index.less';
import HubButton from '@/components/HubButton';
import MinMaxToolBar from '@/components/RightContent/MinMaxToolBar';
import Photo from '@/components/LeftContent/photo';

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
    const { tokenParse } = useInitData();

    useEffect(() => {
        setVisible(props.visible);
    }, [props.visible]);

    const loginToDomain = async (userId: number) => {
        if (localStore.currentDomainId > 0 && localStore.lastUserId != userId) {
            localStore.currentDomainId = 0;
        }
        const res = await queryCurrentUser();
        if (res.fail) {
            return res;
        }
        const currentUser = res.payload;

        if (
            localStore.currentDomainId > 0 &&
            currentUser?.domains.filter((d) => d.domainId == localStore.currentDomainId).length == 0
        ) {
            localStore.currentDomainId = 0;
        }

        if (localStore.currentDomainId > 0) {
            return await switchDomain(localStore.currentDomainId);
        } else {
            const workDomains = currentUser?.domains.filter((d) => {
                return d.domainType == 2;
            });
            if (workDomains && workDomains.length > 0) {
                return await switchDomain(workDomains[0].domainId);
            }
        }
        return { fail: false };
    };

    const handleSubmit = async (values: API.Login) => {
        setLoading(true);
        const email = initialState?.currentUser?.email;

        if (email) {
            const secretKeyVaule = secretKeyStore.getSecretKey(email);
            if (secretKeyVaule) {
                const cryptoService = new TCryptoService();
                const res = await cryptoService.login(email, values.password, secretKeyVaule);
                if (!res.fail) {
                    let token = res.payload.token;
                    sessionStore.token = token;
                    const tempInfo = tokenParse(token);
                    const domainRes = await loginToDomain(tempInfo.UserId);
                    if (!domainRes.fail) {
                        if (domainRes.payload != undefined) {
                            token = domainRes.payload.token;
                            sessionStore.token = domainRes.payload.token;
                        }
                    }
                    setVisible(false);
                    form.setFieldsValue({ password: '' });
                    props.callback?.();
                } else {
                    message.errorIntl('login.unlock.fail', 20001);
                }
            } else {
                gotoLogin();
            }
        } else {
            gotoLogin();
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
