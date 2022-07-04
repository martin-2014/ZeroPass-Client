import { Checkbox, Radio, RadioChangeEvent, Space } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import styles from './index.less';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { openIPFS } from '@/utils/tools';

export type RoamingBackupType = 'google' | 'ipfs';

export interface RoamingSettingData {
    enable: boolean;
    type?: RoamingBackupType;
}

const DataRoamingSetting = (props: {}, ref: any) => {
    const [enableBackup, setEnableBackup] = useState<boolean>(ref.current?.enable ?? false);
    const [backupType, setBackupType] = useState<RoamingBackupType>(ref.current?.type ?? 'ipfs');
    const intl = useIntl();

    const onBackupTypeChange = (e: RadioChangeEvent) => {
        setBackupType(e.target.value);
        ref.current.type = backupType;
    };

    const onEnableBackup = (e: CheckboxChangeEvent) => {
        setEnableBackup(e.target.checked);
        ref.current = {
            enable: e.target.checked,
            type: backupType,
        };
    };

    return (
        <>
            <div>
                <Checkbox onChange={onEnableBackup} checked={enableBackup}>
                    <FormattedMessage id="setting.sync.subtitle" />
                </Checkbox>
            </div>
            <div>
                <Radio.Group
                    disabled={!enableBackup}
                    onChange={onBackupTypeChange}
                    value={backupType}
                >
                    <Space direction="vertical" style={{ paddingLeft: '30px' }}>
                        <Radio value={'ipfs'}>
                            <img
                                src="./icons/ipfs.ico"
                                style={{ width: '20px', marginRight: '5px' }}
                            />
                            IPFS{' '}
                            <QuestionCircleOutlined
                                className={styles.question}
                                title={intl.formatMessage({ id: 'setting.sync.ipfs.question' })}
                                onClick={(e) => openIPFS()}
                            />
                        </Radio>

                        {/* <Radio value={'google'}>Google Drive</Radio> */}
                    </Space>
                </Radio.Group>
            </div>
        </>
    );
};

export default React.forwardRef(DataRoamingSetting);
