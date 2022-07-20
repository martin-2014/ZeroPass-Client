import { localStore } from '@/browserStore/store';
import { OpenDefaultBrowser } from '@/components/Actions';
import FormGroup from '@/components/Form/FormGroup';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import { HubEye, HubEyeInvisible } from '@/components/HubEye';
import Image from '@/components/Image';
import PasswordGenerate from '@/components/PasswordGenerate';
import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { Access } from '@/services/api/logins';
import { VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { ScanOutlined } from '@ant-design/icons';
import { Form, FormInstance, Input, Progress, Space, Tooltip } from 'antd';
import debounce from 'lodash/debounce';
import { HOTP, TOTP, URI } from 'otpauth';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { useList } from '@/pages/Home/Context/hooks';
import { FORM_ICON_SIZE } from '../../tools';
import Header from '../Header';
import IconMap from '../IconMap';
import styles from './index.less';

type Props = {
    form: FormInstance<any>;
    onClose?: (alias: string) => void;
    changeLoadingState?: (load: boolean) => void;
    accesses?: Access[];
    tags?: string[];
    isEdit: boolean;
    img?: string;
    passwordVisible?: boolean;
    isShowPassWord?: boolean;
    onShowPassword?: (show: boolean) => void;
    isNewItem?: boolean;
};

const MAX_LENGTH = 255;
const FormContent = React.forwardRef((props: Props, ref: any) => {
    const {
        isNewItem,
        form,
        onClose,
        changeLoadingState,
        tags = [],
        passwordVisible,
        isShowPassWord,
        isEdit,
        onShowPassword,
        img,
    } = props;
    const [showCreatePass, setShowCreatePass] = useState(false);
    const { selectedId, selectedItem, personal } = useList();
    const { setNewTag } = useTagList();
    const containerId = selectedItem?.containerId;
    const [passwordInputType, setPasswordInputType] = useState<'text' | 'password'>('text');
    const isEditing = props.isNewItem || props.isEdit;
    const Intl = useIntl();
    const [showTOTPError, setShowTOTPError] = useState(false);
    const [totalPercentTOTP, setTotalPercentTOTP] = useState(0);
    const [strokeColor, setStrokeColor] = useState('green');
    const [otPasswordFront, setOTPasswordFront] = useState('');
    const [otPasswordBack, setOTPasswordBack] = useState('');
    const [countDown, setCountDown] = useState('');
    const prePassword = form.getFieldValue('loginPassword');

    const handleDetectCode = useCallback(
        debounce(
            async () => {
                if (electron) {
                    const code = await electron.detectQrCode();
                    if (code) {
                        form.setFieldsValue({ oneTimePassword: code });
                        message.successIntl('login.qrcodedetect.success');
                    } else {
                        message.errorIntl('login.qrcodedetect.fail');
                    }
                }
            },
            500,
            { leading: true, trailing: false },
        ),
        [],
    );

    const handleFinish = async (form: FormInstance<any>) => {
        let data = form.getFieldsValue();
        const id = data.id;
        const description =
            typeof data.description === 'string' ? data.description.trim() : data.description;
        const alias = typeof data.alias === 'string' ? data.alias.trim() : data.alias;
        data = { ...data, description, alias };
        form.setFieldsValue({ description, alias });
        changeLoadingState?.(true);

        const payload: any = {};
        const keys = Object.keys(data);
        var cryptoService = new TCryptoService();
        for (const key of keys) {
            if (key == 'loginPassword' || key == 'oneTimePassword') {
                payload[key] = await cryptoService.encryptText(data[key], true);
            } else if (key == 'passwordUpdateTime') {
                payload[key] =
                    data['loginPassword'] !== prePassword ? new Date().toISOString() : data[key];
            } else {
                payload[key] = data[key];
            }
        }

        const requester = isNewItem ? personal.create : personal.update;
        const { loginUser, loginUri, loginPassword, oneTimePassword, note, passwordUpdateTime } =
            payload;

        const res = await requester({
            id: id,
            type: VaultItemType.Login,
            name: data.name,
            description: loginUser,
            detail: {
                loginUser,
                loginUri,
                loginPassword,
                oneTimePassword,
                note,
                passwordUpdateTime,
            },
            tags: tags,
        });
        changeLoadingState?.(false);
        if (!res.fail) {
            message.successIntl('common.save.success', 3);
            setNewTag();
            onClose?.('');
        } else {
            errHandlers.default(res);
        }

        changeLoadingState?.(false);
    };

    useEffect(() => {
        if (passwordVisible && isShowPassWord) {
            setPasswordInputType('text');
        } else {
            setPasswordInputType('password');
        }
    });

    const getFieldDisplay = (field: string) => {
        return isEditing || form.getFieldValue(field) ? '' : 'none';
    };

    const removeBlank = (secret: any) => {
        return secret.replace(/\s/g, '');
    };

    const createTOTP = (secret: any): TOTP | HOTP | null => {
        let totp: TOTP | HOTP;
        try {
            if (secret.startsWith('otpauth')) {
                totp = URI.parse(secret);
            } else {
                totp = new TOTP({ secret: removeBlank(secret) });
            }
            return totp;
        } catch {
            return null;
        }
    };

    const maxSeconds = 30;
    const colorThreshold = (10 / maxSeconds) * 100;
    const generatePassword = (secret: any): string | null => {
        if (secret) {
            secret = secret.trim();
            const totp = createTOTP(secret);
            if (totp) {
                setShowTOTPError(false);
                const seconds = new Date().getUTCSeconds();
                const percent = (1 - (seconds % maxSeconds) / maxSeconds) * 100;
                if (Math.floor(percent) > Math.floor(colorThreshold)) {
                    setStrokeColor('green');
                } else {
                    setStrokeColor('red');
                }
                setTotalPercentTOTP(percent);
                setCountDown(Math.round((percent / 100) * 30));
                return totp.generate();
            } else {
                setShowTOTPError(true);
            }
        }
        return null;
    };

    const showOneTimePassword = () => {
        const secret = form.getFieldValue('oneTimePassword');
        const password = generatePassword(secret);
        if (password) {
            setOTPasswordFront(password.substring(0, 3));
            setOTPasswordBack(password.substring(3));
        } else {
            setOTPasswordFront('');
            setOTPasswordBack('');
        }
    };

    useEffect(() => {
        const timer = setInterval(showOneTimePassword, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        setShowTOTPError(false);
        setOTPasswordFront('');
        setOTPasswordBack('');
    }, [form.getFieldValue('id')]);

    const copyOneTimePassword = () => {
        const secret = form.getFieldValue('oneTimePassword');
        const password = generatePassword(secret);
        return password ?? '';
    };

    const handleShowPwd = (show: boolean) => {
        if (show && passwordVisible) {
            onShowPassword?.(true);
            setPasswordInputType('text');
        } else {
            onShowPassword?.(show);
            setPasswordInputType('password');
        }
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
            <FormItem
                name={'name'}
                rules={[
                    {
                        required: true,
                        whitespace: false,
                    },
                ]}
                noStyle
            >
                <Header
                    isEdit={isEdit || isNewItem}
                    Icon={
                        <Image
                            src={isNewItem ? 'defaultFavicon' : img}
                            defaulticon={IconMap(VaultItemType.Login, FORM_ICON_SIZE)}
                        ></Image>
                    }
                    style={{
                        display: isEdit === false && isNewItem === false ? 'none' : '',
                    }}
                    placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                ></Header>
            </FormItem>
            <FormGroup>
                <FormItem
                    name="loginUser"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    noStyle
                >
                    <FormInput
                        title="vault.loginUserName"
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('loginUser')}
                        isRequiredField={true}
                    >
                        <Input maxLength={MAX_LENGTH} className={styles.input} />
                    </FormInput>
                </FormItem>
                <FormItem
                    name="loginPassword"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    noStyle
                >
                    <FormInput
                        title="vault.loginPassword"
                        isEdit={isNewItem || isEdit}
                        isRequiredField={true}
                        copyValue={() => form.getFieldValue('loginPassword')}
                        fieldButtions={[
                            {
                                icon: isShowPassWord ? <HubEye /> : <HubEyeInvisible />,
                                onclick: () => {
                                    handleShowPwd(!isShowPassWord);
                                },
                            },
                        ]}
                    >
                        {isNewItem || isEdit ? (
                            <Input.Password maxLength={MAX_LENGTH} className={styles.inputPwd} />
                        ) : (
                            <Input
                                maxLength={MAX_LENGTH}
                                className={styles.input}
                                type={passwordInputType}
                            ></Input>
                        )}
                    </FormInput>
                </FormItem>
            </FormGroup>
            <div style={{ textAlign: 'right' }}>
                {isEdit || isNewItem ? (
                    <a onClick={() => setShowCreatePass(!showCreatePass)}>
                        <FormattedMessage id="password.generator" />
                    </a>
                ) : (
                    <></>
                )}
            </div>
            <PasswordGenerate
                visible={showCreatePass}
                fillPassword={(password) => form.setFieldsValue({ loginPassword: password })}
                close={() => setShowCreatePass(false)}
            />
            <FormGroup>
                <FormItem
                    name="loginUri"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                    noStyle
                >
                    <FormInput
                        title="vault.loginUri"
                        wrapperStyle={{ marginTop: '20px' }}
                        isEdit={isNewItem || isEdit}
                        isRequiredField={true}
                        copyValue={() => form.getFieldValue('loginUri')}
                        appId={selectedId}
                        containerId={containerId}
                        fieldButtions={
                            isEditing || !selectedItem
                                ? undefined
                                : [
                                      {
                                          icon: (
                                              <OpenDefaultBrowser
                                                  type="personal"
                                                  appId={selectedItem.key}
                                                  domainId={localStore.personalDomainId}
                                              />
                                          ),
                                      },
                                  ]
                        }
                    >
                        {/* Google Chrome allows the maximum length of the URL to be of the size 2MB(2048 characters). */}
                        <Input
                            maxLength={2048}
                            className={styles.input}
                            placeholder="https://example.com"
                        />
                    </FormInput>
                </FormItem>
                <FormItem name="oneTimePassword" noStyle>
                    <FormInput
                        wrapperStyle={{
                            display: getFieldDisplay('oneTimePassword'),
                        }}
                        title="vault.oneTimePassword"
                        isEdit={isNewItem || isEdit}
                        copyValue={copyOneTimePassword}
                    >
                        {isEditing ? (
                            <Input
                                className={styles.input}
                                placeholder={Intl.formatMessage({
                                    id: 'vault.oneTimePassword.hint',
                                })}
                                addonAfter={
                                    <Tooltip
                                        title={Intl.formatMessage({ id: 'login.qrcodedetect.tip' })}
                                    >
                                        <ScanOutlined
                                            style={{ fontSize: 20 }}
                                            onClick={handleDetectCode}
                                        />
                                    </Tooltip>
                                }
                            />
                        ) : showTOTPError ? (
                            <div style={{ height: 30, lineHeight: '30px' }}>
                                {Intl.formatMessage({
                                    id: 'vault.oneTimePassword.format.error',
                                })}
                            </div>
                        ) : (
                            <div>
                                <Space style={{ height: 30 }}>
                                    <span className={styles.span}>{otPasswordFront}</span>
                                    <span className={styles.span}>{otPasswordBack}</span>
                                    <Progress
                                        style={{ transform: 'scaleX(-1)', display: 'flex' }}
                                        type="circle"
                                        showInfo={false}
                                        strokeColor={strokeColor}
                                        strokeWidth={15}
                                        trailColor={'unset'}
                                        percent={totalPercentTOTP}
                                        width={15}
                                    />
                                    <span>{countDown}</span>
                                </Space>
                            </div>
                        )}
                    </FormInput>
                </FormItem>
            </FormGroup>
            <FormGroup>
                <FormItem name="note" noStyle>
                    <FormInput
                        title="vault.note"
                        wrapperStyle={{ display: getFieldDisplay('note'), marginTop: '20px' }}
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
            <Form.Item name="passwordUpdateTime" hidden={true}>
                <Input />
            </Form.Item>
        </Form>
    );
});
export default FormContent;
