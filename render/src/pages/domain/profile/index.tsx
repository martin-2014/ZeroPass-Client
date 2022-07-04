import { Input, Upload, Form, Select, Space, Row, Col, Slider } from 'antd';
import { FormattedMessage, useIntl, useModel } from 'umi';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import styles from './index.less';
import { PlusOutlined } from '@ant-design/icons';
import country from '@/utils/country';
import { base64ThumbImage } from '@/utils/tools';
import { putDomains, getDomains } from '@/services/api/domain';
import message from '@/utils/message';
import HubButton from '@/components/HubButton';
import ImgCrop from 'antd-img-crop';

let payload: any = undefined;

const DomainProfile: FC<Record<string, any>> = () => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { initialState, setInitialState } = useModel('@@initialState');

    const intl = useIntl();

    const [form] = Form.useForm();

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

    const setForm = (data) => {
        form.setFieldsValue({
            domainName: data.domainName,
            company: data.company,
            contactPerson: data.contactPerson,
            contactPhone: data.contactPhone,
            country: data.country,
        });
        if (data.logo) {
            setFileList([{ thumbUrl: data.logo }]);
        }
    };

    const getProfile = async () => {
        try {
            const data = await getDomains();
            if (Object.keys(data.error).length) {
                message.errorIntl(data.error.id);
            } else {
                payload = data.payload;
                setForm(payload);
            }
        } catch (error) {
            message.error(intl.formatMessage({ id: 'common.get.data.failed' }));
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const onFinish = async (values: API.DomainUpdateModel) => {
        setLoading(true);
        if (fileList.length) {
            const file = fileList[0];
            if (file.hasOwnProperty('originFileObj')) {
                if (!checkFile(file)) {
                    setLoading(false);
                    return;
                }
                values.logo = await base64ThumbImage(file);
            } else {
                values.logo = file.thumbUrl;
            }
        } else {
            values.logo = '';
        }
        try {
            const res = await putDomains(values);
            if (Object.keys(res.error).length) {
                message.errorIntl(res.error.id);
            } else {
                setInitialState((info) => ({
                    ...info!,
                    currentUser: {
                        ...info?.currentUser!,
                        company: values['company'],
                        domains: setCompanyLogo(info?.currentUser?.domains, values.logo),
                        logo: values.logo,
                    },
                }));
                message.success(intl.formatMessage({ id: 'common.save.success' }));
            }
        } catch (erro) {
            message.error(intl.formatMessage({ id: 'common.save.failed' }));
        } finally {
            setLoading(false);
        }
    };

    const setCompanyLogo = (domains, logo) => {
        const currentDomain = domains.find(
            (d) => d.domainId == initialState?.currentUser?.domainId,
        );
        currentDomain.logo = logo;
        return domains;
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
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                labelAlign="left"
                colon={false}
                requiredMark={false}
                size="small"
            >
                <Form.Item
                    label={
                        <>
                            <FormattedMessage id="register.form.plan.type" />
                        </>
                    }
                    name="userType"
                    initialValue={2}
                >
                    <Select
                        showArrow={false}
                        disabled
                        options={[
                            {
                                label: intl.formatMessage({
                                    id: 'register.business.type.trial',
                                }),
                                value: 2,
                            },
                        ]}
                    ></Select>
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="domainProfile.domainName" />}
                    name="domainName"
                >
                    <Input disabled maxLength={255} />
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="domainProfile.companyName" />}
                    name="company"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: <FormattedMessage id="domainProfile.companyName.required" />,
                        },
                    ]}
                >
                    <Input maxLength={255} />
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="domainProfile.contactPerson" />}
                    name="contactPerson"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: <FormattedMessage id="domainProfile.contactPerson.required" />,
                        },
                    ]}
                >
                    <Input maxLength={55} />
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="domainProfile.contactPhone" />}
                    name="contactPhone"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: <FormattedMessage id="domainProfile.contactPhone.required" />,
                        },
                    ]}
                >
                    <Input maxLength={64} />
                </Form.Item>
                <Form.Item
                    label={<FormattedMessage id="domainProfile.country" />}
                    name="country"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: <FormattedMessage id="domainProfile.country.required" />,
                        },
                    ]}
                >
                    <Select
                        allowClear={false}
                        showSearch={true}
                        filterOption={(input, option) =>
                            (option!.label as unknown as string)
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        options={Object.keys(country).map((key) => {
                            return {
                                label: intl.formatMessage({
                                    id: `country.${key}`,
                                }),
                                value: key,
                            };
                        })}
                    ></Select>
                </Form.Item>
                <Row style={{ height: 112 }}>
                    <Col span={8}>
                        <FormattedMessage id="domainProfile.logo" />
                    </Col>
                    <Col span={5}>
                        <Form.Item noStyle name="logo">
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
                    </Col>
                    <Col span={11}>
                        <span className="hubFontColorNormal">
                            {<FormattedMessage id="domain.profile.logo.tips" />}
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col span={8}></Col>
                    <Col span={16}>
                        <Space className={styles.submit}>
                            <HubButton
                                loadingVisible={loading}
                                width={80}
                                onClick={() => form.submit()}
                            >
                                {intl.formatMessage({ id: 'common.save' })}
                            </HubButton>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default DomainProfile;
