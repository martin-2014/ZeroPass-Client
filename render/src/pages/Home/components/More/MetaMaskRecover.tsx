import SimpleModal from '@/components/SimpleModal';

import { useEffect, useMemo, useState } from 'react';
import { useModel, FormattedMessage, useIntl } from 'umi';
import message from '@/utils/message';

import ProfileSelect from '../MetaMaskRawDataForm/ProfileSelect';
import { MetaMaskRawDataDetail } from '@/services/api/vaultItems';
import { Item } from '@/pages/Home/datatypes';
import HubAlert from '@/components/HubAlert';

const RecoverModal = (props: { onClose: () => void; item: Item }) => {
    const intl = useIntl();
    const [profiles, setProfiles] = useState<MetaMask.BrowserProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [warnings, setWarnings] = useState<string[]>([]);
    const profilesVisible = useMemo(() => {
        return profiles && profiles.length > 0;
    }, [profiles]);
    const { initialState } = useModel('@@initialState');
    const { item: selectedItem } = props;

    useEffect(() => {
        const detectProfiles = async () => {
            if (electron) {
                const values = await electron.detectBrowserProfiles({
                    mode: 'recover',
                });
                if (values && values.length > 0) {
                    setProfiles(values);
                    setSelectedProfile(0);
                    checkWalletState(values[0]);
                } else {
                    message.errorIntl('vault.metaMaskRawData.noProfile');
                    handleClose();
                }
            }
        };
        if (selectedItem) {
            detectProfiles();
        }
    }, [selectedItem]);

    const handleProfileChange = async (val: number) => {
        setSelectedProfile(val);
        checkWalletState(profiles[val]);
    };

    const handleOk = async () => {
        if (electron) {
            recover();
        }
        handleClose();
    };

    const handleClose = () => {
        props.onClose();
        setProfiles([]);
        setWarnings([]);
    };

    const checkWalletState = async (profile: MetaMask.BrowserProfile) => {
        if (electron) {
            const state = await electron.getMetaMaskWalletState(profile);
            const newWarnings = [];
            if (state !== 'nonexistent') {
                newWarnings.push('vault.metaMaskRawData.warning.overwriteWallet');
            }
            if (state === 'unwritable') {
                newWarnings.push('vault.metaMaskRawData.warning.closeBrowser');
            }
            setWarnings(newWarnings);
        }
    };

    const recover = async () => {
        if (selectedProfile !== null) {
            const profile = profiles[selectedProfile];
            setProcessing(true);
            await onRecover(profile);
            setProcessing(false);
        }
    };

    const onRecover = async (profile: MetaMask.BrowserProfile) => {
        if (electron) {
            const detail: MetaMaskRawDataDetail = selectedItem?.detail;
            const args = {
                userId: initialState?.currentUser?.id!,
                profile: profile,
                backupName: detail.dataFile,
            };

            if (!(await electron.recoverMetaMaskWalletBackup(args))) {
                message.errorIntl('vault.metaMaskRawData.msg.recoverFail');
            } else {
                message.successIntl('vault.metaMaskRawData.msg.recoverSuccess');
            }
        }
    };

    return (
        <>
            <SimpleModal
                visible={profilesVisible}
                okText={intl.formatMessage({ id: 'vault.metaMaskRawData.btn.recover' })}
                title={<FormattedMessage id="vault.metaMaskRawData.title.recover" />}
                close={handleClose}
                onOk={handleOk}
                loading={processing}
            >
                <div style={{ width: '100%', height: '180px' }}>
                    <div style={{ marginBottom: '5px' }}>
                        <FormattedMessage id="vault.metaMaskRawData.chooseRecover" />
                    </div>
                    <div style={{ paddingLeft: '5px' }}>
                        <ProfileSelect
                            profiles={profiles}
                            onChange={handleProfileChange}
                            selectedValue={selectedProfile}
                        ></ProfileSelect>
                        <div style={{ marginTop: '5px' }}>
                            {warnings.map((warning, index) => (
                                <HubAlert
                                    key={index}
                                    msg={<FormattedMessage id={warning} />}
                                    type="warning"
                                ></HubAlert>
                            ))}
                        </div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default RecoverModal;
