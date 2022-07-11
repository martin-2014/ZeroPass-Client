import { HubEye, HubEyeInvisible } from '@/components/HubEye';
import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { MetaMaskMnemonicPhraseDetail, VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { Col, Form, FormInstance, Input, Row, Select } from 'antd';
import React from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { useList } from '@/pages/Home/Context/hooks';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import Header from '../Header';
import styles from './index.less';
import FormGroup from '@/components/Form/FormGroup';
import Tip from '../Tip';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type Props = {
    form: FormInstance<any>;
    onUpdate?: (updateValues: MetaMaskMnemonicPhraseDetail, tags: string[]) => void;
    changeLoadingState?: (load: boolean) => void;
    tags?: string[];
    isEdit: boolean;
    isNewItem?: boolean;
    showMnemonicPhrase?: boolean;
    onShowMnemonicPhrase?: (value: boolean) => void;
    getMnemonicPhraseValue?: () => string;
    showWalletPassword?: boolean;
    onShowWalletPassword?: (value: boolean) => void;
};

const SectionOne = ['mnemonicPhrase', 'walletPassword', 'defaultNetwork'];
const SectionTwo = ['note'];
const defaultNetworks = {
    0: 'vault.MetaMaskMnemonicPhrase.form.network.ethereum',
    1: 'vault.MetaMaskMnemonicPhrase.form.network.binance',
};

const FormContent = React.forwardRef((props: Props, ref: any) => {
    const {
        isNewItem,
        form,
        onUpdate,
        changeLoadingState,
        tags = [],
        isEdit,
        showMnemonicPhrase = false,
        onShowMnemonicPhrase = () => {},
        getMnemonicPhraseValue = () => '',
        showWalletPassword = false,
        onShowWalletPassword = () => {},
    } = props;
    const Intl = useIntl();
    const { personal, selectedId } = useList();
    const { setNewTag } = useTagList();
    const submit = async (form: FormInstance<any>) => {
        const data = form.getFieldsValue();
        const requester = isNewItem ? personal.create : personal.update;
        const cryptoService = new TCryptoService();
        const title = data.title.trim();
        changeLoadingState?.(true);

        const detail: MetaMaskMnemonicPhraseDetail = {
            title: title,
            mnemonicPhrase: data.mnemonicPhrase,
            walletPassword: data.walletPassword,
            defaultNetwork: data.defaultNetwork,
            note: data.note,
        };

        const content = await cryptoService.encryptText(JSON.stringify(detail), true);
        const response = await requester({
            id: selectedId,
            name: title,
            type: VaultItemType.MetaMaskMnemonicPhrase,
            detail: { content },
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
    };

    const isEditing = props.isNewItem || props.isEdit;

    const getFieldDisplay = (field: string) => {
        return isEditing || form.getFieldValue(field) ? '' : 'none';
    };

    const getSectiondDisplay = (fields: string[]) => {
        return isEditing || fields.some((field) => form.getFieldValue(field)) ? '' : 'none';
    };

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
                    Icon={IconMap(VaultItemType.MetaMaskMnemonicPhrase, FORM_ICON_SIZE)}
                    placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                    style={{ display: isEdit === false && isNewItem === false ? 'none' : '' }}
                />
            </FormItem>
            {/* Details */}
            <FormGroup>
                <FormItem name="mnemonicPhrase" rules={[{ required: true }]} noStyle>
                    <FormInput
                        title="vault.MetaMaskMnemonicPhrase.form.mnemonicPhrase"
                        isEdit={isNewItem || isEdit}
                        isRequiredField={true}
                        copyValue={() => getMnemonicPhraseValue()}
                        fieldButtions={[
                            {
                                icon: showMnemonicPhrase ? <HubEye /> : <HubEyeInvisible />,
                                onclick: () => {
                                    onShowMnemonicPhrase(!showMnemonicPhrase);
                                },
                            },
                        ]}
                        suffixRender={
                            <Tip
                                style={{ display: isEdit ? '' : 'none' }}
                                text={Intl.formatMessage({
                                    id: 'wallet.details.mnemonic.phrase.descripton',
                                })}
                            />
                        }
                    >
                        {!isEditing ? (
                            <Input.TextArea
                                autoSize={{ minRows: 1, maxRows: Number.MAX_SAFE_INTEGER }}
                            ></Input.TextArea>
                        ) : (
                            <Input.Password className={styles.input}></Input.Password>
                        )}
                    </FormInput>
                </FormItem>
                <FormItem name="walletPassword" noStyle>
                    <FormInput
                        title="vault.MetaMaskMnemonicPhrase.form.walletPassword"
                        wrapperStyle={{
                            display: getFieldDisplay('walletPassword'),
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('walletPassword')}
                        fieldButtions={[
                            {
                                icon: showWalletPassword ? <HubEye /> : <HubEyeInvisible />,
                                onclick: () => {
                                    onShowWalletPassword(!showWalletPassword);
                                },
                            },
                        ]}
                        suffixRender={
                            <Tip
                                style={{ display: isEditing ? '' : 'none' }}
                                text={Intl.formatMessage({
                                    id: 'vault.metaMaskRawData.password.tip',
                                })}
                            ></Tip>
                        }
                    >
                        {!isEditing ? (
                            <Input
                                className={styles.input}
                                type={showWalletPassword ? 'text' : 'password'}
                            ></Input>
                        ) : (
                            <Input.Password className={styles.input}></Input.Password>
                        )}
                    </FormInput>
                </FormItem>
                <FormItem name="defaultNetwork" noStyle>
                    <FormInput
                        title="vault.MetaMaskMnemonicPhrase.form.defaultNetwork"
                        isEdit={isNewItem || isEdit}
                        isRequiredField={true}
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
                            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                            suffixIcon={<></>}
                        >
                            {Object.entries(defaultNetworks).map(([key, value]) => (
                                <Select.Option value={key} key={key}>
                                    {Intl.formatMessage({ id: `${value}` })}
                                </Select.Option>
                            ))}
                        </Select>
                    </FormInput>
                </FormItem>
            </FormGroup>
            {/* Other */}
            <Row
                style={{
                    marginTop: '5px',
                    marginBottom: '5px',
                    display: getSectiondDisplay(SectionTwo),
                }}
            >
                <Col span={24}>
                    <span className="hubFontColorNormal">
                        <FormattedMessage id="vault.MetaMaskMnemonicPhrase.form.group.other" />
                    </span>
                </Col>
            </Row>
            <FormGroup>
                <FormItem name="note" noStyle>
                    <FormInput
                        title="vault.note"
                        wrapperStyle={{ display: getFieldDisplay('note') }}
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
