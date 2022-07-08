import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { PersonalInfoDetail, VaultItemType } from '@/services/api/vaultItems';
import country from '@/utils/country';
import message from '@/utils/message';
import { Col, Form, FormInstance, Input, Row, Select, Tooltip } from 'antd';
import React from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { useList } from '../../Context/hooks';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import FormGroup from '@/components/Form/FormGroup';
import Header from '../Header';
import styles from './index.less';
import { Copy } from '@icon-park/react';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type Props = {
    form: FormInstance<any>;
    onUpdate?: (updateValues: PersonalInfoDetail, tags: string[]) => void;
    changeLoadingState?: (load: boolean) => void;
    tags?: string[];
    isEdit: boolean;
    isNewItem?: boolean;
    visible: (fieldName: string) => string;
};

const FormContent = React.forwardRef((props: Props, ref: any) => {
    const { isNewItem, form, onUpdate, changeLoadingState, tags = [], visible, isEdit } = props;
    const Intl = useIntl();
    const { personal, selectedId } = useList();
    const { setNewTag } = useTagList();
    const handleFinish = async (form: FormInstance<any>) => {
        let data = form.getFieldsValue();
        const title = data.title.trim();
        const description = data.fullName;
        changeLoadingState?.(true);

        const detail: PersonalInfoDetail = {
            title: title,
            fullName: description,
            email: data.email,
            phone: data.phone,
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            province: data.province,
            zipCode: data.zipCode,
            country: data.country,
            note: data.note,
        };

        var cryptoService = new TCryptoService();
        var plainContent = JSON.stringify(detail);
        const content = {};
        content['content'] = await cryptoService.encryptText(plainContent, true);

        const requester = isNewItem ? personal.create : personal.update;
        const response = await requester({
            id: selectedId,
            name: title,
            description: description,
            type: VaultItemType.PersonalInfo,
            detail: content,
            tags: tags,
        });
        changeLoadingState?.(false);
        if (!response.fail) {
            message.successIntl('common.save.success', 3);
            setNewTag();
            onUpdate?.(detail, tags);
        } else {
            errHandlers.default(response);
        }

        changeLoadingState?.(false);
    };

    const handleAddressGroupCopy = () => {
        const getFieldVaule = (fieldName: string) => {
            return form.getFieldValue(fieldName) ? `${form.getFieldValue(fieldName)} ` : '';
        };
        const data: string = `${getFieldVaule('address1')}${getFieldVaule(
            'address2',
        )}${getFieldVaule('city')}${getFieldVaule('province')}${getFieldVaule(
            'zipCode',
        )}${Intl.formatMessage({ id: `country.${form.getFieldValue('country')}` })}`;
        navigator.clipboard.writeText(data);
        message.success(Intl.formatMessage({ id: 'common.copied' }));
    };

    return (
        <Form
            ref={ref}
            onFinish={() => {
                handleFinish(form);
            }}
            layout="vertical"
            name="basic"
            initialValues={{ remember: true }}
            autoComplete="off"
            requiredMark="optional"
            form={props.form}
            style={{ width: '100%' }}
        >
            <FormItem name="title" rules={[{ required: true, whitespace: false }]} noStyle>
                <Header
                    isEdit={isEdit || isNewItem}
                    Icon={IconMap(VaultItemType.PersonalInfo, FORM_ICON_SIZE)}
                    placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                    style={{ display: isEdit === false && isNewItem === false ? 'none' : '' }}
                />
            </FormItem>
            {/* Contact Details */}
            <Row style={{ marginBottom: '10px' }}>
                <Col span={24}>
                    <span className="hubFontColorNormal">
                        <FormattedMessage id="vault.personalInfo.form.group.contact" />
                    </span>
                </Col>
            </Row>
            <FormGroup>
                <FormItem name="fullName" rules={[{ required: true }]} noStyle>
                    <FormInput
                        title="vault.personalInfo.form.fullName"
                        isEdit={isNewItem || isEdit}
                        isRequiredField={true}
                        copyValue={() => form.getFieldValue('fullName')}
                    >
                        <Input className={styles.input} />
                    </FormInput>
                </FormItem>
                <FormItem name="email" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.email"
                        wrapperStyle={{
                            display: visible('email'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('email')}
                    >
                        <Input className={styles.input} />
                    </FormInput>
                </FormItem>
                <FormItem name="phone" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.phone"
                        wrapperStyle={{
                            display: visible('phone'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('phone')}
                    >
                        <Input className={styles.input} />
                    </FormInput>
                </FormItem>
            </FormGroup>
            {/* Address Details */}
            <Row justify="end" style={{ margin: '10px 0', display: visible('groupAddress') }}>
                <Col span={23}>
                    <span className="hubFontColorNormal">
                        <FormattedMessage id="vault.personalInfo.form.group.address" />
                    </span>
                </Col>
                <Col span={1}>
                    <Tooltip title={Intl.formatMessage({ id: 'common.copy' })}>
                        <Copy
                            className={'zp-icon'}
                            size={18}
                            onClick={handleAddressGroupCopy}
                            style={{ display: isNewItem || isEdit ? 'none' : '' }}
                        />
                    </Tooltip>
                </Col>
            </Row>
            <FormGroup>
                <FormItem name="address1" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.address1"
                        wrapperStyle={{
                            display: visible('address1'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('address1')}
                    >
                        <Input
                            className={styles.input}
                            placeholder={Intl.formatMessage({
                                id: 'vault.personalInfo.form.address1.hint',
                            })}
                        />
                    </FormInput>
                </FormItem>
                <FormItem name="address2" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.address2"
                        wrapperStyle={{
                            display: visible('address2'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('address2')}
                    >
                        <Input
                            className={styles.input}
                            placeholder={Intl.formatMessage({
                                id: 'vault.personalInfo.form.address2.hint',
                            })}
                        />
                    </FormInput>
                </FormItem>
                <Row>
                    <Col
                        span={visible('province') === 'none' ? 24 : 12}
                        style={{ display: visible('city') }}
                    >
                        <FormItem name="city" noStyle>
                            <FormInput
                                title="vault.personalInfo.form.city"
                                wrapperStyle={{
                                    display: visible('city'),
                                    borderRadius: 0,
                                }}
                                isEdit={isNewItem || isEdit}
                                copyValue={() => form.getFieldValue('city')}
                                innerStyle={{
                                    minHeight: 60,
                                    borderBottom: '1px solid #e1e1e1',
                                    borderRight:
                                        visible('province') !== 'none'
                                            ? '1px solid #e1e1e1'
                                            : 'unset',
                                }}
                            >
                                <Input className={styles.input} />
                            </FormInput>
                        </FormItem>
                    </Col>
                    <Col
                        span={visible('city') === 'none' ? 24 : 12}
                        style={{ display: visible('province') }}
                    >
                        <FormItem name="province" noStyle>
                            <FormInput
                                title="vault.personalInfo.form.province"
                                wrapperStyle={{
                                    display: visible('province'),
                                    borderRadius: 0,
                                }}
                                isEdit={isNewItem || isEdit}
                                copyValue={() => form.getFieldValue('province')}
                                innerStyle={{ minHeight: 60, borderBottom: '1px solid #e1e1e1' }}
                            >
                                <Input className={styles.input} />
                            </FormInput>
                        </FormItem>
                    </Col>
                </Row>
                <FormItem name="zipCode" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.zipCode"
                        wrapperStyle={{
                            display: visible('zipCode'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('zipCode')}
                    >
                        <Input className={styles.input} />
                    </FormInput>
                </FormItem>
                <FormItem name="country" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.country"
                        wrapperStyle={{
                            display: visible('country'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() =>
                            Intl.formatMessage({ id: `country.${form.getFieldValue('country')}` })
                        }
                    >
                        <Select
                            className={styles.select}
                            optionFilterProp="children"
                            filterOption={(input, option) => {
                                const optionValue = option?.children?.toString().toLowerCase();
                                if (!optionValue) return false;
                                return optionValue?.indexOf(input.toLowerCase()) >= 0;
                            }}
                            showSearch
                            allowClear
                            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                            suffixIcon={<></>}
                        >
                            {Object.keys(country).map((key) => (
                                <Select.Option key={key} value={key}>
                                    {Intl.formatMessage({ id: `country.${key}` })}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormInput>
                </FormItem>
            </FormGroup>
            {/* Other */}
            <Row style={{ marginTop: '5px', marginBottom: '5px', display: visible('groupOther') }}>
                <Col span={24}>
                    <span className="hubFontColorNormal">
                        <FormattedMessage id="vault.personalInfo.form.group.other" />
                    </span>
                </Col>
            </Row>
            <FormGroup>
                <FormItem name="note" noStyle>
                    <FormInput
                        title="vault.personalInfo.form.note"
                        wrapperStyle={{ display: visible('note') }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('note')}
                    >
                        <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: Number.MAX_SAFE_INTEGER }}
                        ></Input.TextArea>
                    </FormInput>
                </FormItem>
            </FormGroup>
            <Form.Item name="id" hidden={true}>
                <Input />
            </Form.Item>
        </Form>
    );
});
export default FormContent;
