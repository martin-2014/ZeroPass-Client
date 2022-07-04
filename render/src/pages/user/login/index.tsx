import { localStore, secretKeyStore, sessionStore } from '@/browserStore/store';
import HubButton from '@/components/HubButton';
import Help from '@/components/RightContent/Help';
import MinMaxToolBar from '@/components/RightContent/MinMaxToolBar';
// import Header from '@/components/Header';
import useInitData from '@/hooks/useInitData';
import ipcHandler, { syncItemListToPlugin } from '@/ipc/ipcHandler';
import { KeyStore, setKeyStore } from '@/models/keyStore';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { TEncryptionKey } from '@/secretKey/secretKey';
import { currentUser as queryCurrentUser, loginLocal, switchDomain } from '@/services/api/user';
import message from '@/utils/message';
import {
    DownOutlined,
    FolderOpenOutlined,
    LockOutlined,
    MailOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { Col, Form, Input, Row } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import styles from './index.less';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const secretKey = useRef('');
    const [form] = Form.useForm();
    const intl = useIntl();
    const [submited, setSubmited] = useState(false);
    const { initDataWhenLogin, tokenParse } = useInitData();

    if (window.electron) {
        window.electron.logout();
        ipcHandler.startUp();
    }
    const setFileKey = (value: string) => {
        form.setFieldsValue({ fileKey: value });
    };

    const secretKeyInit = (user: string) => {
        const lastKey = secretKeyStore.getSecretKey(user);
        if (lastKey) {
            setFileKey(lastKey.substring(0, 8) + '**** **** ****');
            secretKey.current = lastKey;
        } else {
            setFileKey('');
            secretKey.current = '';
            setShowUpload(true);
        }
    };

    useEffect(() => {
        const lastUser = localStore.lastUser;
        if (lastUser) secretKeyInit(lastUser);
    }, []);

    const searchKey = () => {
        const email = form.getFieldValue('email');
        if (email) secretKeyInit(email);
    };

    const readFileText = async (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        function onFileLoad() {
            return new Promise((resolve, reject) => {
                reader.onload = (m) => {
                    resolve(m);
                };
                reader.onerror = (m) => {
                    reject(m);
                };
            });
        }
        const onLoad = await onFileLoad();
        if (onLoad.type == 'load') {
            return reader.result?.toString();
        }
        return '';
    };

    const fileChange = async (e: any) => {
        if ((e.path.length = 0)) {
            return;
        }
        const files = e.path[0].files;
        const file = files[0];
        const fileString = await readFileText(file);
        if (fileString) {
            setFileKey(fileString);
            secretKey.current = fileString;
        }
    };

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
            if (workDomains.length > 0) {
                return await switchDomain(workDomains[0].domainId);
            }
        }
        return { fail: false };
    };

    const handleSubmit = async (values: API.Login) => {
        setSubmited(true);
        const email = values.email;
        localStore.lastUser = email;
        localStore.rememberUser = true;

        let secretKeyVaule = secretKey.current;
        if (!secretKeyVaule) {
            setShowUpload(true);
            return;
        }

        try {
            setLoading(true);
            const keyObj = new TEncryptionKey(email, values.password, secretKeyVaule);
            var cryptoService = new TCryptoService();
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
                } else {
                    message.errorIntl(res.errorId);
                }

                secretKeyStore.setSecretKey(email, secretKeyVaule);
                // TODO: get the domain key id also. luis
                await setKeyStore(new KeyStore(secretKeyVaule, 'enterprise', keyObj));
                const userInfo = await initDataWhenLogin(token);
                await loginLocal({ email: email, id: userInfo?.id! });
                if (userInfo) {
                    await cryptoService.preCacheDataKey(true);
                    if (userInfo.domains?.length > 0) {
                        await cryptoService.preCacheDataKey(false);
                    }
                    if (userInfo.isOwner) {
                        history.push('/workassigned/adminconsole/dashboard');
                    } else {
                        history.push('/personal/menus/quickerfinder/favourites');
                    }
                    message.success(intl.formatMessage({ id: 'login.success' }));
                }
                if (window.electron) {
                    window.electron.login();
                    electron.sendUserLogin();
                }
                syncItemListToPlugin();
                return;
            } else {
                setShowUpload(true);
                if (res.errorId == 'err_authentication_failed') {
                    message.errorIntl('err.login.fail');
                } else {
                    message.errorIntl(res.errorId);
                }
            }
        } catch (error) {
            setShowUpload(true);
            const defaultLoginFailureMessage = intl.formatMessage({
                id: 'login.failure',
            });
            message.error(defaultLoginFailureMessage);
        }
        setSubmited(false);
        setLoading(false);
    };

    const createFileUpload = () => {
        const upload = document.createElement('input');
        upload.type = 'file';
        upload.onchange = (e) => fileChange(e);
        upload.click();
    };

    const FileValue = () => {
        const onChange = () => {
            secretKey.current = form.getFieldValue('fileKey');
        };
        return (
            <Form.Item name="fileKey" noStyle>
                <Input
                    style={{ border: 'none' }}
                    onChange={onChange}
                    bordered={false}
                    placeholder={intl.formatMessage({ id: 'userProfile.divider.secretKey' })}
                ></Input>
            </Form.Item>
        );
    };

    const createAcount = () => {
        history.push('/user/domain/register');
    };

    return (
        <div
            className={styles.main}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    form.submit();
                }
            }}
        >
            <div className={styles.appDrag}>
                <div className={styles.appNoDrag}>
                    <div className={styles.More}>
                        <Help color="#949494" />
                    </div>
                    <MinMaxToolBar btnClassName={styles.toolbar} style={{ color: '#949494' }} />
                </div>
            </div>
            <div className={styles.left}>
                <div className={styles.leftTop}>
                    <img width={250} src="./icons/logo-login.png"></img>
                </div>
                <div className={styles.leftMid}>
                    <div className={styles.content}>
                        <div className={styles.header}>
                            <FormattedMessage id="login.info.header" />
                        </div>
                        <div className={styles.text}>
                            <FormattedMessage id="login.info.content" />
                        </div>
                    </div>
                </div>
                <div className={styles.leftBot}>
                    <HubButton
                        type="default"
                        width={316}
                        height={48}
                        style={{ margin: 'auto', color: 'white', borderColor: 'white' }}
                        onClick={createAcount}
                    >
                        {intl.formatMessage({ id: 'register.form.createAccount' })}
                    </HubButton>
                </div>
            </div>
            <div className={styles.right}>
                <div className={styles.login}>
                    <div className={styles.img}>
                        <FormattedMessage id="login.sign.in" />
                    </div>
                    <Form
                        form={form}
                        name="normal_login"
                        className="login-form"
                        initialValues={{
                            remember: localStore.rememberUser,
                            email: localStore.lastUser,
                        }}
                        onFinish={async (values) => {
                            await handleSubmit(values as API.Login);
                        }}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: <FormattedMessage id="login.id.required" />,
                                },
                            ]}
                            hasFeedback={false}
                        >
                            <Input
                                autoComplete="on"
                                className={styles.input}
                                prefix={<MailOutlined className={styles.prefix} />}
                                placeholder={intl.formatMessage({ id: 'login.email' })}
                                onBlur={searchKey}
                                bordered={false}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: <FormattedMessage id="login.password.required" />,
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
                        <Form.Item noStyle>
                            <div className={styles.uploadSwitch}>
                                {showUpload ? (
                                    <UpOutlined
                                        className={styles.uploadSwitchIcon}
                                        onClick={() => setShowUpload(!showUpload)}
                                        width={20}
                                    />
                                ) : (
                                    <DownOutlined
                                        className={styles.uploadSwitchIcon}
                                        onClick={() => setShowUpload(!showUpload)}
                                    />
                                )}
                            </div>
                        </Form.Item>
                        <Form.Item hidden={!showUpload} noStyle>
                            <Row className={styles.fileInput}>
                                <Col span={22}>
                                    <FileValue />
                                </Col>
                                <Col span={2} onClick={createFileUpload}>
                                    <FolderOpenOutlined className={styles.uploadIcon} />
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item noStyle>
                            <div className={styles.fileInputError}>
                                {!form.getFieldValue('fileKey') && submited ? (
                                    <div>{<FormattedMessage id="login.key.required" />}</div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </Form.Item>
                        <Form.Item className={styles.submit} noStyle>
                            <HubButton
                                loadingVisible={loading}
                                style={{ width: '100%' }}
                                height={48}
                                onClick={form.submit}
                            >
                                {intl.formatMessage({ id: 'pages.login.submit' })}
                            </HubButton>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
