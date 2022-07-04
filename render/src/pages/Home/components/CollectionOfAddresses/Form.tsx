import { HubEye, HubEyeInvisible } from '@/components/HubEye';
import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { AddressesDetail, VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Input } from 'antd';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'umi';
import { useList } from '../../Context/hooks';
import Header from '../Header';
import styles from './index.less';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import FormGroup from '@/components/Form/FormGroup';
import Tip from '../Tip';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type Props = {
    form: FormInstance<any>;
    onUpdate?: (updateValues: AddressesDetail, tags: string[]) => void;
    changeLoadingState?: (load: boolean) => void;
    tags?: string[];
    isEdit: boolean;
    isNewItem?: boolean;
    showPrivateKey?: boolean[];
    onShowPrivateKey?: (value: boolean[]) => void;
};

const SectionOne = ['address', 'privateKey', 'note'];

const FormContent = React.forwardRef((props: Props, ref: any) => {
    const {
        isNewItem,
        form,
        onUpdate,
        changeLoadingState,
        tags = [],
        isEdit,
        showPrivateKey = [],
        onShowPrivateKey = ([]) => {},
    } = props;
    const Intl = useIntl();
    const { personal, selectedId } = useList();
    const { setNewTag } = useTagList();
    const isEditing = props.isNewItem || props.isEdit;
    const sectionButton = useRef<HTMLElement | undefined>();

    const submit = async (form: FormInstance<any>) => {
        const data = form.getFieldsValue();
        const requester = isNewItem ? personal.create : personal.update;
        const cryptoService = new TCryptoService();
        const title = data.title.trim();
        changeLoadingState?.(true);
        const detail: AddressesDetail = {
            title: title,
            addresses: [],
        };
        data.addresses.forEach((element) =>
            detail.addresses.push({
                address: (element.address as string)?.trim(),
                privateKey: element.privateKey,
                note: element.note,
            }),
        );

        const content = await cryptoService.encryptText(JSON.stringify(detail), true);
        const response = await requester({
            id: selectedId,
            name: title,
            type: VaultItemType.Addresses,
            detail: { content },
            tags: tags,
        });

        changeLoadingState?.(false);
        if (!response.fail) {
            message.successIntl('common.save.success', 3);
            setNewTag('personal');
            onUpdate?.(detail, tags);
        } else {
            errHandlers.default(response);
        }
    };

    const getFieldDisplay = (index: number, field: string) => {
        const data = form.getFieldsValue();
        if (data.addresses) {
            const section = data.addresses[index];
            if (section) {
                return isEditing || section[field] ? '' : 'none';
            }
        }
        return '';
    };

    useEffect(() => {
        sectionButton?.current?.click();
    }, []);

    return (
        <Form
            ref={ref}
            onFinish={() => {
                submit(form);
            }}
            layout="vertical"
            name="basic"
            initialValues={{ defaultNetwork: '0' }}
            autoComplete="off"
            requiredMark="optional"
            form={props.form}
            style={{ width: '100%' }}
        >
            <FormItem name="title" rules={[{ required: true, whitespace: false }]} noStyle>
                <Header
                    isRequiredField={true}
                    suffixRender={
                        <Tip text={Intl.formatMessage({ id: 'wallet.details.tip' })}></Tip>
                    }
                    title={isEdit ? 'vault.title' : ''}
                    isEdit={isEdit || isNewItem}
                    Icon={IconMap(VaultItemType.Addresses, FORM_ICON_SIZE)}
                    placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                    style={{ display: isEdit === false && isNewItem === false ? 'none' : '' }}
                />
            </FormItem>
            <Form.List name="addresses">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <div style={{ marginTop: '10px' }} key={name}>
                                <MinusCircleOutlined
                                    onClick={() => {
                                        remove(name);
                                    }}
                                    style={{
                                        color: 'red',
                                        display: isEditing && fields.length > 1 ? '' : 'none',
                                    }}
                                />
                                <FormGroup>
                                    <FormItem
                                        {...restField}
                                        name={[name, 'address']}
                                        rules={[{ required: true }]}
                                        noStyle
                                    >
                                        <FormInput
                                            title="vault.addresses.form.address"
                                            isEdit={isNewItem || isEdit}
                                            isRequiredField={true}
                                            copyValue={() =>
                                                form.getFieldsValue().addresses[name]['address']
                                            }
                                        >
                                            <Input className={styles.input}></Input>
                                        </FormInput>
                                    </FormItem>
                                    <FormItem {...restField} name={[name, 'privateKey']} noStyle>
                                        <FormInput
                                            title="vault.addresses.form.privateKey"
                                            wrapperStyle={{
                                                display: getFieldDisplay(name, 'privateKey'),
                                            }}
                                            isEdit={isNewItem || isEdit}
                                            copyValue={() =>
                                                form.getFieldsValue().addresses[name]['privateKey']
                                            }
                                            fieldButtions={[
                                                {
                                                    icon: showPrivateKey[name] ? (
                                                        <HubEye />
                                                    ) : (
                                                        <HubEyeInvisible />
                                                    ),
                                                    onclick: () => {
                                                        let newShowPrivateKey = [...showPrivateKey];
                                                        newShowPrivateKey[name] =
                                                            !showPrivateKey[name];
                                                        onShowPrivateKey(newShowPrivateKey);
                                                    },
                                                },
                                            ]}
                                        >
                                            {!isEditing ? (
                                                <Input
                                                    className={styles.input}
                                                    type={
                                                        showPrivateKey[name] ? 'text' : 'password'
                                                    }
                                                ></Input>
                                            ) : (
                                                <Input.Password
                                                    className={styles.input}
                                                ></Input.Password>
                                            )}
                                        </FormInput>
                                    </FormItem>
                                    <FormItem {...restField} name={[name, 'note']} noStyle>
                                        <FormInput
                                            title="vault.note"
                                            wrapperStyle={{
                                                display: getFieldDisplay(name, 'note'),
                                            }}
                                            isEdit={isNewItem || isEdit}
                                            copyValue={() =>
                                                form.getFieldsValue().addresses[name]['note']
                                            }
                                        >
                                            <Input.TextArea
                                                autoSize={{
                                                    maxRows: Number.MAX_SAFE_INTEGER,
                                                }}
                                            ></Input.TextArea>
                                        </FormInput>
                                    </FormItem>
                                </FormGroup>
                            </div>
                        ))}

                        <Form.Item
                            className={styles.button}
                            style={{
                                display: isEdit === false && isNewItem === false ? 'none' : '',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    ref={sectionButton}
                                    name="addAddress"
                                    type="link"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                >
                                    {Intl.formatMessage({ id: 'vault.addresses.form.addAddress' })}
                                </Button>
                                <Tip
                                    text={Intl.formatMessage({
                                        id: 'wallet.details.address.descripton',
                                    })}
                                ></Tip>
                            </div>
                        </Form.Item>
                    </>
                )}
            </Form.List>

            <Form.Item name="id" hidden={true}>
                <Input />
            </Form.Item>
        </Form>
    );
});
export default FormContent;
