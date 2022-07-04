import { Form, Select, Col, Row, Space, Input, Slider, Tooltip, Upload } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl, useModel } from 'umi';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import styles from './index.less';
import timezone from '@/utils/timezone';
import { UpdateUserProfile } from '@/services/api/user';
import { secretKeyStore } from '@/browserStore/store';
import { downloadSecretKey } from '@/utils/secretKeyDownloader';
import message from '@/utils/message';
import HubButton from '@/components/HubButton';
import { PlusOutlined } from '@ant-design/icons';
import { base64ThumbImage } from '@/utils/tools';
import ImgCrop from 'antd-img-crop';

interface pros {
    close: (v: boolean) => void;
}

const { Option } = Select;

const UserProfile: FC<pros> = (pros) => {
    const [saveLoading, setSaveLoading] = useState(false);
    const intl = useIntl();
    const [form] = Form.useForm();
    const { initialState, setInitialState } = useModel('@@initialState');
    const [fileList, setFileList] = useState([]);

    let currentUser = initialState?.currentUser;

    const UserType = (up: { type: number | undefined }) => {
        if (currentUser?.isOwner) {
            return <FormattedMessage id="register.business.type.trial" />;
        } else {
            return up.type == 2 ? (
                <FormattedMessage id="userProfile.userType.standard" />
            ) : (
                <FormattedMessage id="userProfile.userType.basic" />
            );
        }
    };

    const setForm = () => {
        form.setFieldsValue({
            email: currentUser?.email,
            userName: currentUser?.userName,
            timezone: currentUser?.timezone,
        });
        if (currentUser?.photo) setFileList([{ thumbUrl: currentUser?.photo }]);
    };

    useEffect(() => {
        setForm();
    }, []);

    const cancel = () => {
        pros.close(false);
    };

    const checkFile = (file) => {
        if (!file.type && !file.size) {
            return true;
        }
        const isType =
            file.type === 'image/jpeg' ||
            file.type === 'image/svg+xml' ||
            file.type === 'image/png';
        if (!isType) {
            message.error(intl.formatMessage({ id: 'domain.profile.img.type' }));
            return false;
        }
        if (file.size > 1024 * 1024 * 2) {
            message.error(intl.formatMessage({ id: 'domain.profile.img.size.max' }));
            return false;
        }
        return true;
    };

    const onFinish = async () => {
        setSaveLoading(true);
        const values = form.getFieldsValue();

        if (fileList.length) {
            const file = fileList[0];
            if (file.hasOwnProperty('originFileObj')) {
                if (!checkFile(file)) {
                    setSaveLoading(false);
                    return;
                }
                values.logo = await base64ThumbImage(file);
            } else {
                values.logo = file.thumbUrl;
            }
        } else {
            values.logo = '';
        }
        const params: API.UpdateUserProfile = {
            userName: values.userName,
            timezone: values.timezone,
            photo: values.logo,
        };
        try {
            const res = await UpdateUserProfile(params);
            setSaveLoading(false);
            if (Object.keys(res.error).length) {
                message.errorIntl(res.error.id);
            } else {
                setInitialState((info) => ({
                    ...info!,
                    currentUser: {
                        ...currentUser!,
                        userName: values.userName,
                        timezone: values.timezone,
                        photo: values.logo,
                    },
                }));
                message.success(intl.formatMessage({ id: 'common.save.success' }));
                cancel();
            }
        } catch (erro) {
            message.error(intl.formatMessage({ id: 'common.save.failed' }));
            setSaveLoading(false);
        }
    };

    const copyEvent = () => {
        const email = currentUser?.email;
        if (email) {
            const secretKey = secretKeyStore.getSecretKey(email);
            if (secretKey) {
                navigator.clipboard.writeText(secretKey);
                message.success(
                    intl.formatMessage({ id: 'userProfile.divider.secretKey.copy.success' }),
                );
                return;
            }
        }
        message.error(intl.formatMessage({ id: 'userProfile.secretKey.notFound.error' }));
    };

    const downloadEvent = () => {
        const email = currentUser?.email;
        if (email) {
            const secretKey = secretKeyStore.getSecretKey(email);
            if (secretKey) {
                downloadSecretKey(email, secretKey);
                return;
            }
        }
        message.error(intl.formatMessage({ id: 'userProfile.secretKey.notFound.error' }));
    };

    const handleChange = (s) => {
        setFileList(s.fileList);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>
                <FormattedMessage id="domainProfile.upload" />
            </div>
        </div>
    );

    return (
        <div className={styles.main}>
            <Slider style={{ display: 'none' }} />
            <Form
                form={form}
                className={styles.form}
                name="basic"
                onFinish={onFinish}
                labelCol={{ span: 7, offset: 1 }}
                wrapperCol={{ span: 17 }}
                colon={false}
                labelAlign="left"
                requiredMark={false}
            >
                <Form.Item label={<FormattedMessage id="userProfile.email" />} name="email">
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="userProfile.userName" />}
                    name="userName"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: <FormattedMessage id="userProfile.userName.required" />,
                        },
                    ]}
                >
                    <Input maxLength={255} />
                </Form.Item>
                <Form.Item
                    style={{ display: 'none' }}
                    label={<FormattedMessage id="userProfile.timezone" />}
                    name="timezone"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: <FormattedMessage id="userProfile.timeZone.required" />,
                        },
                    ]}
                >
                    <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option!.label as unknown as string)
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                    >
                        {timezone.map((obj) => (
                            <Option value={obj.offset} key={obj.tzCode}>
                                {obj.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{
                        height: 112,
                        overflow: 'hidden',
                        display: initialState?.currentUser?.isOwner ? 'none' : '',
                    }}
                    label={<FormattedMessage id="userProfile.photo" />}
                    name="photo"
                >
                    <ImgCrop
                        rotate
                        shape="round"
                        zoom={true}
                        modalTitle={intl.formatMessage({ id: 'userProfile.edit.image' })}
                        modalTransitionName="image-edit-modal"
                        modalWidth={530}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleChange}
                            showUploadList={{ showPreviewIcon: false }}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </ImgCrop>
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="register.form.plan.type" />}
                    name="planType"
                >
                    <UserType type={currentUser?.userType} />
                </Form.Item>
                <Row style={{ margin: '0 0 20px 0' }}>
                    <Col span={4}>
                        <span className="hubFontColorNormal">
                            <FormattedMessage id="userProfile.divider.secretKey" />
                        </span>
                    </Col>
                    <Col span={20}>
                        <div
                            style={{
                                height: 1,
                                marginTop: 13,
                                width: '100%',
                                backgroundColor: '#a9a9a9',
                                opacity: '0.2',
                            }}
                        ></div>
                    </Col>
                </Row>
                <Row justify="center" style={{ marginBottom: 20 }}>
                    <Space align="center" size="large">
                        <Tooltip
                            title={<FormattedMessage id="userProfile.divider.secretKey.copy.tip" />}
                        >
                            <HubButton
                                addonBefore={<CopyOutlined />}
                                type="primary"
                                onClick={copyEvent}
                                height={32}
                                width={200}
                            >
                                {intl.formatMessage({
                                    id: 'userProfile.divider.secretKey.copy',
                                })}
                            </HubButton>
                        </Tooltip>
                        {<FormattedMessage id="userProfile.divider.secretKey.or" />}
                        <Tooltip
                            title={
                                <FormattedMessage id="userProfile.divider.secretKey.download.tip" />
                            }
                        >
                            <HubButton
                                type="primary"
                                onClick={downloadEvent}
                                height={32}
                                width={200}
                                addonBefore={<DownloadOutlined />}
                            >
                                {intl.formatMessage({
                                    id: 'userProfile.divider.secretKey.download',
                                })}
                            </HubButton>
                        </Tooltip>
                    </Space>
                </Row>
                <Row>
                    <Col span={24} style={{ textAlign: 'center' }}>
                        <Space className={styles.submit}>
                            <HubButton
                                width={90}
                                type="default"
                                onClick={cancel}
                                className={styles.reset}
                            >
                                {intl.formatMessage({ id: 'common.cancel' })}
                            </HubButton>
                            <HubButton
                                width={90}
                                type="primary"
                                loadingVisible={saveLoading}
                                onClick={() => form.submit()}
                            >
                                {intl.formatMessage({ id: 'common.save' })}
                            </HubButton>
                        </Space>
                    </Col>
                    <Col span={2}></Col>
                </Row>
            </Form>
        </div>
    );
};

export default UserProfile;
