import FormGroup from '@/components/Form/FormGroup';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import { HubEye, HubEyeInvisible } from '@/components/HubEye';
import PasswordGenerate from '@/components/PasswordGenerate';
import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { MetaMaskRawDataDetail, VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { MinusCircleOutlined } from '@ant-design/icons';
import { Col, Form, FormInstance, Input, Row, Tooltip } from 'antd';
import React, { useState } from 'react';
import { FormattedMessage, useIntl, useModel } from 'umi';
import { useList } from '@/pages/Home/Context/hooks';
import Header from '../Header';
import styles from './index.less';
import MetaMaskProfileSelect from './MetaMaskProfileSelect';
import Tip from '../../components/Tip';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type Props = {
    form: FormInstance<any>;
    onUpdate?: (updateValues: MetaMaskRawDataDetail, tags: string[]) => void;
    changeLoadingState?: (load: boolean) => void;
    tags: string[];
    isEdit: boolean;
    img?: string;
    passwordVisible?: boolean;
    isShowPassWord?: boolean;
    onShowPassword?: (show: boolean) => void;
    isNewItem?: boolean;
    originalBackup?: string;
    onBackupChange: (backupName: string) => void;
    isShowLocateWallet: boolean;
};

const MAX_LENGTH = 255;

const SectionOne = ['dataFile', 'walletPassword'];
const SectionTwo = ['note'];

const FormContent = React.forwardRef((props: Props, ref: any) => {
    const {
        isNewItem,
        isEdit,
        form,
        onUpdate,
        changeLoadingState,
        tags = [],
        isShowPassWord,
        onShowPassword,
        originalBackup,
        onBackupChange,
        isShowLocateWallet,
    } = props;
    const { initialState } = useModel('@@initialState');
    const [showCreatePass, setShowCreatePass] = useState(false);
    const { selectedId, personal } = useList();
    const [profile, setProfile] = useState<MetaMask.BrowserProfile>();
    const { setNewTag } = useTagList();
    const isEditing = props.isNewItem || props.isEdit;
    const Intl = useIntl();
    const commitBackup = async () => {
        if (electron) {
            return await electron.createMetaMaskWalletBackup({
                userId: initialState?.currentUser?.id!,
                profile: profile!,
                backupName: form.getFieldValue('dataFile'),
            });
        }
        return true;
    };

    const handleFinish = async (form: FormInstance<any>) => {
        changeLoadingState?.(true);
        const backupName = form.getFieldValue('dataFile');
        const backupChanged = originalBackup !== backupName;
        if (backupChanged && backupName && !(await commitBackup())) {
            message.errorIntl('common.save.failed', 3);
            changeLoadingState?.(false);
            return;
        }
        const data = form.getFieldsValue();
        const requester = isNewItem ? personal.create : personal.update;
        const cryptoService = new TCryptoService();
        const title = data.title.trim();
        const encryptedPassword =
            data.walletPassword && (await cryptoService.encryptText(data.walletPassword, true));
        const detail: MetaMaskRawDataDetail = {
            title: title,
            dataFile: data.dataFile!,
            walletPassword: encryptedPassword,
            note: data.note,
        };
        const response = await requester({
            id: selectedId,
            name: title,
            type: VaultItemType.MetaMaskRawData,
            detail: detail,
            tags: tags,
        });

        changeLoadingState?.(false);
        if (!response.fail) {
            message.successIntl('common.save.success', 3);
            setNewTag();
            onUpdate?.({ ...detail, walletPassword: data.walletPassword }, tags);
            if (backupChanged && originalBackup && electron) {
                electron.deleteMetaMaskWalletBackup({
                    userId: initialState?.currentUser?.id!,
                    backupName: originalBackup,
                });
            }
        } else {
            errHandlers.default(response);
        }
    };

    const getSectiondDisplay = (fields: string[]) => {
        return isEditing || fields.some((field) => form.getFieldValue(field)) ? '' : 'none';
    };

    const getFieldDisplay = (field: string) => {
        return isEditing || form.getFieldValue(field) ? '' : 'none';
    };

    const getTimestamp = () => {
        const now = new Date();
        return [
            now.getFullYear() % 2000,
            now.getMonth() + 1,
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
        ]
            .map((part) => part.toString().padStart(2, '0'))
            .join('');
    };

    const handleBackupDelete = () => {
        onBackupChange('');
    };

    const handleProfileSelect = (profile: MetaMask.BrowserProfile) => {
        const fileName = `${profile.browser}-${getTimestamp()}.7z`;
        onBackupChange(fileName);
        setProfile(profile);
    };

    return (
        <>
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
                className={styles.form}
                style={{ width: '100%' }}
            >
                <FormItem name="title" rules={[{ required: true, whitespace: false }]} noStyle>
                    <Header
                        isRequiredField={true}
                        suffixRender={
                            <Tip text={Intl.formatMessage({ id: 'wallet.details.tip' })}></Tip>
                        }
                        title={isEdit ? 'vault.title' : ''}
                        isEdit={isEditing}
                        Icon={IconMap(VaultItemType.MetaMaskRawData, FORM_ICON_SIZE)}
                        placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                        style={{ display: !isEditing ? 'none' : '' }}
                    />
                </FormItem>
                <FormGroup>
                    <FormItem name="dataFile" noStyle rules={[{ required: true }]}>
                        <FormInput
                            title="vault.metaMaskRawData.dataFile"
                            isRequiredField={true}
                            isEdit={isEditing}
                        >
                            <Input
                                className={styles.input}
                                style={{
                                    width: isShowLocateWallet ? '0' : '100%',
                                    display: 'block',
                                    paddingTop: 5,
                                }}
                                readOnly={true}
                                addonAfter={
                                    isEditing &&
                                    (!isShowLocateWallet ? (
                                        <Tooltip
                                            placement="left"
                                            title={Intl.formatMessage({
                                                id: 'vault.metaMaskRawData.btn.delete.tip',
                                            })}
                                        >
                                            <MinusCircleOutlined
                                                className={styles.delete}
                                                onClick={handleBackupDelete}
                                            ></MinusCircleOutlined>
                                        </Tooltip>
                                    ) : (
                                        <MetaMaskProfileSelect
                                            onProfileSelect={handleProfileSelect}
                                        ></MetaMaskProfileSelect>
                                    ))
                                }
                            />
                        </FormInput>
                    </FormItem>
                    <FormItem name="walletPassword" noStyle>
                        <FormInput
                            title="vault.metaMaskRawData.password"
                            wrapperStyle={{
                                display: getFieldDisplay('walletPassword'),
                            }}
                            isEdit={isEditing}
                            copyValue={() => form.getFieldValue('walletPassword')}
                            fieldButtions={[
                                {
                                    icon: isShowPassWord ? <HubEye /> : <HubEyeInvisible />,
                                    onclick: () => {
                                        onShowPassword?.(!isShowPassWord);
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
                            {isEditing ? (
                                <Input.Password maxLength={MAX_LENGTH} />
                            ) : (
                                <Input
                                    maxLength={MAX_LENGTH}
                                    className={styles.input}
                                    type={isShowPassWord ? 'text' : 'password'}
                                ></Input>
                            )}
                        </FormInput>
                    </FormItem>
                </FormGroup>
                <div style={{ textAlign: 'right' }}>
                    {isEditing && (
                        <a onClick={() => setShowCreatePass(!showCreatePass)}>
                            <FormattedMessage id="password.generator" />
                        </a>
                    )}
                </div>
                <PasswordGenerate
                    visible={showCreatePass}
                    fillPassword={(password) => form.setFieldsValue({ walletPassword: password })}
                    close={() => setShowCreatePass(false)}
                />
                <Row
                    style={{
                        marginTop: '5px',
                        marginBottom: '5px',
                        display: getSectiondDisplay(SectionTwo),
                    }}
                >
                    <Col span={24}>
                        <span className="hubFontColorNormal">
                            <FormattedMessage id="vault.other" />
                        </span>
                    </Col>
                </Row>
                <FormGroup>
                    <FormItem name="note" noStyle>
                        <FormInput
                            title="vault.note"
                            wrapperStyle={{
                                display: getFieldDisplay('note'),
                            }}
                            isEdit={isEditing}
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
        </>
    );
});
export default FormContent;
