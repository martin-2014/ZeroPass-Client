import { Form, Button, Col, Row, Input, Divider } from 'antd';
import { FormattedMessage, useIntl, useModel, history } from 'umi';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import styles from './index.less';
import { changePasswrod } from '@/services/api/user';
import { CloseOutlined } from '@ant-design/icons';
import message from '@/utils/message';

interface pros {
    close: (v: boolean) => void;
}

const ChangePassword: FC<pros> = (pros) => {
    const [saveLoading, setSaveLoading] = useState(false);
    const intl = useIntl();

    const [form] = Form.useForm();
    const { initialState } = useModel('@@initialState');

    let currentUser = initialState?.currentUser;

    const setForm = async () => {};

    useEffect(() => {
        setForm();
    }, []);

    const cancel = () => {
        pros.close(false);
    };

    const validatorPassword = (rule: any, value: string, callback: (message?: string) => void) => {
        const values = form.getFieldsValue();
        if (values.rePassword != values.newPassword) {
            callback(intl.formatMessage({ id: 'activate.same.password' }));
        } else {
            callback();
        }
    };

    const onFinish = async () => {
        setSaveLoading(true);
        try {
            if (!currentUser?.zpUserId) throw 'error';
            const res = await changePasswrod(
                currentUser?.zpUserId,
                form.getFieldValue('newPassword'),
            );
            message.success(intl.formatMessage({ id: 'common.save.success' }));
            setTimeout(() => {
                history.push('/user/logout');
            }, 1000);
        } catch (error) {
            message.error(intl.formatMessage({ id: 'common.save.failed' }));
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className={styles.main}>
            <Row style={{ marginTop: -10 }}>
                <Col span="23">
                    <h3>
                        <FormattedMessage id="menu.account.password" />
                    </h3>
                </Col>
                <Col span="1">
                    <span
                        style={{ cursor: 'pointer', color: 'gray', float: 'right', paddingTop: 2 }}
                        onClick={cancel}
                    >
                        <CloseOutlined />
                    </span>
                </Col>
            </Row>
            <Divider style={{ marginTop: 0 }} />
            <Row>
                <Col span={1}></Col>
                <Col span={22}>
                    <Form
                        form={form}
                        className={styles.form}
                        name="basic"
                        onFinish={onFinish}
                        colon={true}
                        size="small"
                    >
                        <Row className={styles.label}>
                            <Col span={7}>
                                <span>
                                    <FormattedMessage id="login.domain" />:
                                </span>
                            </Col>
                            <Col span={17}>{localStorage.getItem('domain')}</Col>
                        </Row>
                        <Row style={{ marginBottom: 35 }} className={styles.label}>
                            <Col span={7}>
                                <span className={styles.label}>
                                    <FormattedMessage id="login.id" />:
                                </span>
                            </Col>
                            <Col span={17}>{currentUser?.loginName}</Col>
                        </Row>
                        <Form.Item
                            name="currentPassword"
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage id="pages.login.password.required" />
                                    ),
                                },
                            ]}
                        >
                            <Input.Password
                                className={styles.input}
                                placeholder={intl.formatMessage({ id: 'login.current.password' })}
                            />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage id="pages.login.password.required" />
                                    ),
                                },
                            ]}
                        >
                            <Input.Password
                                className={styles.input}
                                placeholder={intl.formatMessage({ id: 'login.new.password' })}
                            />
                        </Form.Item>
                        <Form.Item
                            name="rePassword"
                            dependencies={['newPassword']}
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage id="pages.login.password.required" />
                                    ),
                                },
                                {
                                    validator: validatorPassword,
                                },
                            ]}
                        >
                            <Input.Password
                                className={styles.input}
                                placeholder={intl.formatMessage({ id: 'login.re.password' })}
                            />
                        </Form.Item>

                        <Row>
                            <Button
                                className="hubButton"
                                type="primary"
                                loading={saveLoading}
                                htmlType="submit"
                            >
                                {<FormattedMessage id="menu.account.password" />}
                            </Button>
                        </Row>
                    </Form>
                </Col>
                <Col span={1}></Col>
            </Row>
        </div>
    );
};

export default ChangePassword;
