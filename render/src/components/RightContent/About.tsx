import { Tooltip, Checkbox, Badge, Space } from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import styles from './index.less';
import { useState, useEffect } from 'react';
import { localStore } from '@/browserStore/store';
import HubButton from '../HubButton';
import { openServiceAggreement, openPrivacy } from '@/utils/tools';

export type Props = {
    newVersion: string;
};

export default (pros: Props) => {
    const Intl = useIntl();
    const [currentVersion, setCurrentVersion] = useState('1.0.0.0');
    const newVersion = pros.newVersion;

    useEffect(() => {
        if (window.electron) {
            const currentVersion = window.electron.getCurrentVersion();
            setCurrentVersion(currentVersion);
        }
    }, []);

    const installEvent = () => {
        if (window.electron) {
            window.electron.installUpdates();
        }
    };

    const checkEvent = (e) => {
        localStore.isUpdateAutomatically = e.target.checked;
    };

    return (
        <div className={styles.main} style={{ textAlign: 'center', width: '100%' }}>
            <div>
                <img className={styles.img} src={'./icons/logo-blue.png'}></img>
            </div>
            <div style={{ marginTop: '10px', fontSize: '20px', fontWeight: 'bold' }}>
                {currentVersion}
            </div>
            <div style={{ marginTop: '10px', display: newVersion ? '' : 'none' }}>
                <Tooltip title={<FormattedMessage id="about.upgrade.tip" />} zIndex={9999}>
                    <Badge dot>
                        <HubButton size="big" type="primary" onClick={installEvent}>
                            {Intl.formatMessage({ id: 'about.upgrade' }) + ' ' + newVersion}
                        </HubButton>
                    </Badge>
                </Tooltip>
            </div>
            <div style={{ marginTop: '10px' }}>
                <Checkbox defaultChecked={localStore.isUpdateAutomatically} onChange={checkEvent}>
                    {' '}
                    {<FormattedMessage id="about.upgrade.automatically" />}
                </Checkbox>
            </div>
            <div style={{ marginTop: '30px', fontSize: '12px', color: 'gray' }}>
                <FormattedMessage id="about.message.copyright" />
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
                <Space size={2}>
                    <a onClick={openServiceAggreement}>
                        <FormattedMessage id="about.message.user.service" />
                    </a>
                    <span className="hubFontColorLow">|</span>
                    <a onClick={openPrivacy}>
                        <FormattedMessage id="about.message.privacy" />
                    </a>
                </Space>
            </div>
        </div>
    );
};
