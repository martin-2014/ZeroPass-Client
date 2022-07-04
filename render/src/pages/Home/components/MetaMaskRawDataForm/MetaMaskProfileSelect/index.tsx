import HubButton from '@/components/HubButton';
import SimpleModal from '@/components/SimpleModal';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import message from '@/utils/message';
import ProfileSelect from '../ProfileSelect';

type ProfilesProps = {
    onProfileSelect: (profile: MetaMask.BrowserProfile) => void;
};

const ProfilesSelectModal = (props: ProfilesProps) => {
    const Intl = useIntl();
    const { onProfileSelect } = props;
    const [profiles, setProfiles] = useState<MetaMask.BrowserProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<number>(0);

    const modalVisible = useMemo(() => {
        return profiles && profiles.length > 0;
    }, [profiles]);

    const handleDetectProfile = async () => {
        if (electron) {
            const values = await electron.detectBrowserProfiles({
                mode: 'backup',
            });
            if (values && values.length > 0) {
                setProfiles(values);
            } else {
                message.errorIntl('vault.metaMaskRawData.noProfile');
            }
        }
    };

    const handleSave = async () => {
        if (electron) {
            const profile = profiles[selectedProfile];
            onProfileSelect(profile);
        }
        handleColse();
    };

    const handleColse = () => {
        setSelectedProfile(0);
        setProfiles([]);
    };

    return (
        <>
            <HubButton
                type="default"
                onClick={handleDetectProfile}
                addonBefore={
                    <img style={{ verticalAlign: 'text-top' }} src="./icons/fox.png"></img>
                }
                style={{ fontSize: '12px' }}
            >
                {Intl.formatMessage({ id: 'vault.metaMaskRawData.locate' })}
            </HubButton>
            <SimpleModal
                visible={modalVisible}
                close={handleColse}
                onOk={handleSave}
                title={<FormattedMessage id="vault.metaMaskRawData.title.select" />}
            >
                <>
                    <div style={{ marginBottom: 10 }}>
                        <FormattedMessage id="vault.metaMaskRawData.title.select.tip" />
                    </div>
                    <ProfileSelect
                        profiles={profiles}
                        onChange={setSelectedProfile}
                        selectedValue={selectedProfile}
                    ></ProfileSelect>
                </>
            </SimpleModal>
        </>
    );
};

export default ProfilesSelectModal;
