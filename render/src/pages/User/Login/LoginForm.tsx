import { localStore } from '@/browserStore/store';
import HubButton from '@/components/HubButton';
import Help from '@/components/RightContent/Help';
import MinMaxToolBar from '@/components/RightContent/MinMaxToolBar';
import {
    DownOutlined,
    FolderOpenOutlined,
    LockOutlined,
    MailOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { Col, Form, Input, Row } from 'antd';
import useLogin from '@/pages/User/Login/useLogin';
import { FormattedMessage } from 'umi';
import styles from './index.less';

const getForm = () => {
    const {
        secretKey,
        loading,
        showUpload,
        setShowUpload,
        form,
        submited,
        intl,
        searchKey,
        login,
        handleSubmit,
        createFileUpload,
        createAcount,
    } = useLogin();

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
                    placeholder={intl.formatMessage({
                        id: 'userProfile.divider.secretKey',
                    })}
                ></Input>
            </Form.Item>
        );
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
                            await handleSubmit(values as API.Login, login);
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

export default getForm;
