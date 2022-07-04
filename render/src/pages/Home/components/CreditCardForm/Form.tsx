import { HubEye, HubEyeInvisible } from '@/components/HubEye';
import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { CreditCardDetail, VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { Col, Form, FormInstance, Input, Row } from 'antd';
import CardTypes from 'creditcards-types';
import Card from 'creditcards/card';
import React, { useRef } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { useList } from '../../Context/hooks';
import { formatNumber, getDescription, getImgUriByType, getRawNumber } from '../../tools';
import FormInput, { FormatResult } from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import FormGroup from '@/components/Form/FormGroup';
import Header from '../Header';
import styles from './index.less';
import Image from '@/components/Image';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type props = {
    form: FormInstance<any>;
    isNewItem: boolean;
    isEdit: boolean;
    tags?: string[];
    changeLoadingState: (edit: boolean) => void;
    headerUri?: string;
    onUpdate?: (updatedValues: CreditCardDetail, tags: string[], imgUrl: string) => void;
    showCvv?: boolean;
    onShowCvv?: (value: boolean) => void;
    showPin?: boolean;
    onShowPin?: (value: boolean) => void;
};

const SectionOne = ['holder', 'number'];
const SectionTwo = ['expiry', 'cvv', 'zipOrPostalCode', 'pin'];
const SectionThree = ['note'];

const card = Card(CardTypes);

const expiryRegex = /^(0?[1-9]|1[012])(\/)(\d{1,2})$/;

const FormContent = React.forwardRef((props: props, ref: any) => {
    const {
        form,
        tags = [],
        changeLoadingState,
        onUpdate,
        showCvv = false,
        onShowCvv = () => {},
        showPin,
        onShowPin = () => {},
        headerUri = './icons/credit-card.png',
    } = props;
    const { selectedId, personal } = useList();

    const Intl = useIntl();
    const { setNewTag } = useTagList();

    const preNumber = useRef('');
    const preExpiry = useRef('');
    const preCvv = useRef('');
    const prePin = useRef('');

    preNumber.current = form.getFieldValue('number');
    preExpiry.current = form.getFieldValue('expiry');
    preCvv.current = form.getFieldValue('cvv');
    prePin.current = form.getFieldValue('pin');

    const isEditing = props.isNewItem || props.isEdit;

    const getFieldDisplay = (field: string) => {
        return isEditing || form.getFieldValue(field) ? '' : 'none';
    };

    const getSectiondDisplay = (fields: string[]) => {
        return isEditing || fields.some((field) => form.getFieldValue(field)) ? '' : 'none';
    };

    const submit = async () => {
        changeLoadingState(true);
        const formData = form.getFieldsValue();
        const number = getRawNumber(formData['number']);
        const type = card.type(number, true)?.replace(' ', '-')?.toLowerCase();
        const requester = props.isNewItem ? personal.create : personal.update;
        const cryptoService = new TCryptoService();
        const content = await cryptoService.encryptText(JSON.stringify(formData), true);
        const name = formData.title;
        const res = await requester({
            id: selectedId,
            type: VaultItemType.CreditCard,
            name,
            description: getDescription(number),
            detail: { content, cardType: type },
            tags: tags,
        });

        const headerImg = getImgUriByType(type);
        if (!res.fail) {
            message.successIntl('common.save.success');
            setNewTag('personal');
            onUpdate?.(formData, tags, headerImg);
        } else {
            errHandlers.default(res);
        }
        changeLoadingState(false);
    };

    const numberFormatter = (preValue: string, currentValue: string): FormatResult => {
        const separator = ' ';
        const result = {
            separator,
        };

        let value = '' + currentValue;
        if (value === '') {
            return { ...result, formattedValue: value };
        }
        value = getRawNumber(value);
        if (!/^\d{1,19}$/g.test(value)) {
            return { ...result, formattedValue: preValue };
        } else {
            return { ...result, formattedValue: formatNumber(value) };
        }
    };

    const expiryFormatter = (preValue: string, currentValue: string) => {
        const separator = '/';
        const result = {
            separator,
        };
        let value = '' + currentValue;
        if (value === '') {
            return { ...result, formattedValue: value };
        }
        const match = value.match(/^(\d{1,2})?(\/)?(\d{1,2})?$/);
        if (!match) {
            return { ...result, formattedValue: preValue };
        }

        const [month, slash, year] = match.slice(1);
        const m = Number(month);

        if (slash !== undefined) {
            return { ...result, formattedValue: (month || '') + slash + (year || '') };
        }

        if (year !== undefined) {
            return { ...result, formattedValue: month + '/' + year };
        }

        if (m === 0) {
            return { ...result, formattedValue: m.toString() };
        }

        if (m === 1) {
            return { ...result, formattedValue: month };
        }

        return { ...result, formattedValue: m.toString().padStart(2, '0') };
    };

    const formatExpiry = (value: string) => {
        const match = value.match(expiryRegex);
        if (match) {
            const [month, slash, year] = match.slice(1);
            const formattedValue = month.padStart(2, '0') + slash + year.padStart(2, '0');
            preExpiry.current = formattedValue;
            form.setFieldsValue({ expiry: formattedValue });
        }
    };

    const onValueChanges = (changedValues: any, values: any) => {
        if (changedValues['number'] !== undefined) {
            const { formattedValue } = numberFormatter(
                preNumber.current || '',
                changedValues['number'],
            );
            if (formattedValue !== preNumber.current) {
                preNumber.current = formattedValue;
            }
            form.setFieldsValue({ number: formattedValue });
        }

        if (changedValues['expiry'] !== undefined) {
            const { formattedValue } = expiryFormatter(
                preExpiry.current || '',
                changedValues['expiry'],
            );
            if (formattedValue != preExpiry.current) {
                preExpiry.current = formattedValue;
            }
            form.setFieldsValue({ expiry: formattedValue });
        }

        if (changedValues['cvv'] !== undefined) {
            const value = '' + changedValues['cvv'];
            if (value === '') {
                preCvv.current = value;
                return;
            }
            if (!/^\d{1,4}$/g.test(value)) {
                form.setFieldsValue({ cvv: preCvv.current });
            } else {
                preCvv.current = value;
            }
        }

        if (changedValues['pin'] !== undefined) {
            const value = '' + changedValues['pin'];
            if (value === '') {
                prePin.current = value;
                return;
            }
            if (!/^\d{1,12}$/g.test(value)) {
                form.setFieldsValue({ pin: prePin.current });
            } else {
                prePin.current = value;
            }
        }
    };

    return (
        <Form
            name="creditCardForm"
            ref={ref}
            form={form}
            autoComplete="off"
            onValuesChange={onValueChanges}
            onFinish={submit}
        >
            <FormItem name="title" rules={[{ required: true, whitespace: false }]} noStyle>
                <Header
                    isEdit={true}
                    Icon={
                        <Image
                            src={headerUri}
                            defaulticon={IconMap(VaultItemType.CreditCard, FORM_ICON_SIZE)}
                        />
                    }
                    placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                    style={{ display: isEditing ? '' : 'none' }}
                ></Header>
            </FormItem>
            <Row style={{ marginBottom: '10px' }}>
                <Col>
                    <span className="hubFontColorNormal">
                        <FormattedMessage id="vault.creditCard.details" />
                    </span>
                </Col>
            </Row>
            <FormGroup>
                <FormItem name="holder" noStyle>
                    <FormInput
                        title="vault.creditCard.holder"
                        isEdit={isEditing}
                        wrapperStyle={{
                            display: getFieldDisplay('holder'),
                        }}
                        copyValue={() => form.getFieldValue('holder')}
                    >
                        <Input className={styles.input}></Input>
                    </FormInput>
                </FormItem>
                <FormItem name="number" rules={[{ required: true, whitespace: false }]} noStyle>
                    <FormInput
                        title="vault.creditCard.number"
                        isEdit={isEditing}
                        isRequiredField={true}
                        wrapperStyle={{
                            display: getFieldDisplay('number'),
                        }}
                        copyValue={() => getRawNumber(form.getFieldValue('number'))}
                        formatter={numberFormatter}
                    >
                        <Input className={styles.input}></Input>
                    </FormInput>
                </FormItem>
            </FormGroup>

            <Row style={{ marginTop: '10px', display: getSectiondDisplay(SectionTwo) }}></Row>
            <FormGroup>
                <FormItem name="expiry" noStyle rules={[{ pattern: expiryRegex }]}>
                    <FormInput
                        title="vault.creditCard.expiry"
                        isEdit={isEditing}
                        wrapperStyle={{
                            display: getFieldDisplay('expiry'),
                        }}
                        placeholder="mm/yy"
                        copyValue={() => form.getFieldValue('expiry')}
                        formatter={expiryFormatter}
                        onBlur={(e) => formatExpiry(e.target.value)}
                    >
                        <Input className={styles.input}></Input>
                    </FormInput>
                </FormItem>
                <FormItem name="cvv" noStyle rules={[{ pattern: /^\d+$/ }]}>
                    <FormInput
                        title="vault.creditCard.cvv"
                        isEdit={isEditing}
                        wrapperStyle={{
                            display: getFieldDisplay('cvv'),
                        }}
                        copyValue={() => form.getFieldValue('cvv')}
                        fieldButtions={[
                            {
                                icon: showCvv ? <HubEye /> : <HubEyeInvisible />,
                                onclick: () => {
                                    onShowCvv(!showCvv);
                                },
                            },
                        ]}
                    >
                        {!isEditing ? (
                            <Input
                                className={styles.input}
                                type={showCvv ? 'text' : 'password'}
                            ></Input>
                        ) : (
                            <Input.Password maxLength={4} className={styles.input}></Input.Password>
                        )}
                    </FormInput>
                </FormItem>
                <FormItem name="zipOrPostalCode" noStyle>
                    <FormInput
                        title="vault.creditCard.zipOrPostalCode"
                        isEdit={isEditing}
                        wrapperStyle={{
                            display: getFieldDisplay('zipOrPostalCode'),
                        }}
                        copyValue={() => form.getFieldValue('zipOrPostalCode')}
                    >
                        <Input className={styles.input}></Input>
                    </FormInput>
                </FormItem>
                <FormItem name="pin" noStyle>
                    <FormInput
                        title="vault.creditCard.pin"
                        isEdit={isEditing}
                        wrapperStyle={{
                            display: getFieldDisplay('pin'),
                        }}
                        fieldButtions={[
                            {
                                icon: showPin ? <HubEye /> : <HubEyeInvisible />,
                                onclick: () => {
                                    onShowPin(!showPin);
                                },
                            },
                        ]}
                        copyValue={() => form.getFieldValue('pin')}
                    >
                        {!isEditing ? (
                            <Input
                                className={styles.input}
                                type={showPin ? 'text' : 'password'}
                            ></Input>
                        ) : (
                            <Input.Password
                                maxLength={12}
                                className={styles.input}
                            ></Input.Password>
                        )}
                    </FormInput>
                </FormItem>
            </FormGroup>
            <Row style={{ margin: '10px 0', display: getSectiondDisplay(SectionThree) }}>
                <Col>
                    <span className="hubFontColorNormal">
                        <FormattedMessage id="vault.creditCard.other" />
                    </span>
                </Col>
            </Row>
            <FormGroup>
                <FormItem name="note" noStyle>
                    <FormInput
                        title="vault.creditCard.note"
                        isEdit={isEditing}
                        wrapperStyle={{
                            display: getFieldDisplay('note'),
                        }}
                        copyValue={() => form.getFieldValue('note')}
                    >
                        <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: Number.MAX_SAFE_INTEGER }}
                        ></Input.TextArea>
                    </FormInput>
                </FormItem>
            </FormGroup>
            <Form.Item name="cardType" hidden={true}>
                <Input />
            </Form.Item>
        </Form>
    );
});

export default FormContent;
