import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import HubButton from '@/components/HubButton';
import SimpleModal from '@/components/SimpleModal';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { extractMnemonic } from '@/services/api/metamask';
import { MetaMaskRawDataDetail } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { Form, Input, Space } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useModel } from 'umi';
import { Item } from '../../datatypes';
import styles from './index.less';

export default (props: { onClose: () => void; item: Item }) => {
    const { item } = props;
    const { initialState } = useModel('@@initialState');
    const [passwordNeeded, setPasswordNeeded] = useState(false);
    const [showPasswordError, setShowPasswordError] = useState(false);
    const [mnemonic, setMnemonic] = useState<string>('');
    const [footerType, setFooterType] = useState<'password' | 'copy'>('password');
    const formRef = useRef<any>();
    const [form] = Form.useForm();

    useEffect(() => {
        revealWithItemPassword();
    }, []);

    const revealWithItemPassword = async () => {
        const cryptoService = new TCryptoService();
        const detail: MetaMaskRawDataDetail = item.detail;
        const walletPassword = detail.walletPassword
            ? await cryptoService.decryptText(detail.walletPassword, true)
            : '';
        if (!walletPassword) {
            setPasswordNeeded(true);
            return;
        }
        await revealByPwd(walletPassword);
    };

    const revealWithInputPassword = async () => {
        const pwd = form.getFieldValue('password');
        await revealByPwd(pwd);
    };

    const revealByPwd = async (pwd: string) => {
        const detail: MetaMaskRawDataDetail = item.detail;
        const account = await electron.extractMetaMaskAccount({
            userId: initialState?.currentUser?.id!,
            backupName: detail.dataFile,
            properties: ['KeyringController.vault'],
        });
        if (account === undefined || account['KeyringController.vault'] === undefined) {
            message.errorIntl('wallet.mnemonicReveal.errNoAccount');
            props.onClose();
            return;
        }
        const vault = account['KeyringController.vault'];
        try {
            const extractedValue = await extractMnemonic(pwd, vault);
            setPasswordNeeded(false);
            setMnemonic(extractedValue!);
            setFooterType('copy');
        } catch (err: any) {
            setPasswordNeeded(true);
            setShowPasswordError(true);
        }
    };

    const copy = (val: string) => {
        navigator.clipboard.writeText(val);
        message.successIntl('common.copied');
    };

    const PasswordFooter = (
        <div>
            <Space style={{ margin: 'auto' }}>
                <HubButton width={100} type="default" onClick={props.onClose}>
                    <FormattedMessage id="common.cancel" />
                </HubButton>
                <HubButton
                    width={100}
                    type="primary"
                    onClick={() => {
                        formRef.current?.submit();
                    }}
                >
                    <FormattedMessage id="common.next" />
                </HubButton>
            </Space>
        </div>
    );

    const CopyFooter = (
        <div>
            <HubButton
                style={{ margin: 'auto' }}
                type="primary"
                onClick={() => {
                    copy(mnemonic);
                }}
            >
                <FormattedMessage id="common.copyToClipborad" />
            </HubButton>
        </div>
    );
    const Footer = useMemo(() => {
        return footerType === 'password' ? PasswordFooter : CopyFooter;
    }, [footerType]);

    return (
        <SimpleModal
            title={<FormattedMessage id="wallet.mnemonicReveal.title" />}
            close={props.onClose}
            visible={true}
            footer={Footer}
        >
            <div style={{ minHeight: '75px' }}>
                <div style={{ display: passwordNeeded ? '' : 'none' }}>
                    <Form ref={formRef} form={form} onFinish={revealWithInputPassword}>
                        <FormItem name="password" rules={[{ required: true, whitespace: false }]}>
                            <FormInput
                                title="wallet.mnemonicReveal.passwordDescription"
                                onChange={() => {
                                    setShowPasswordError(false);
                                }}
                            >
                                <Input.Password></Input.Password>
                            </FormInput>
                        </FormItem>
                    </Form>
                    <div>
                        {showPasswordError && (
                            <span className={styles.err}>
                                <FormattedMessage id="wallet.mnemonicReveal.incorrectPassword" />
                            </span>
                        )}
                    </div>
                </div>
                <div
                    className={styles.mnemonicContainer}
                    style={{ display: mnemonic ? '' : 'none' }}
                >
                    <div className={styles.mnemonicDescription}>
                        <FormattedMessage id="wallet.mnemonicReveal.mnemonicDescription" />
                    </div>
                    <div>{mnemonic}</div>
                </div>
            </div>
        </SimpleModal>
    );
};
