import { Typography, Radio, Space, RadioChangeEvent } from 'antd';
import HubButton from '@/components/HubButton';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { exportData, importData } from '@/services/api/dataStorage';
import message from '@/utils/message';
import { FormattedMessage, useModel } from 'umi';

const { Text } = Typography;

type RestoreType = 'overwrite' | 'merge';

const dataStorage = () => {
    const [restoreType, setRestoreType] = useState<RestoreType>('overwrite');
    const { initialState } = useModel('@@initialState');

    const onRestoreRadioChanged = (e: RadioChangeEvent) => {
        setRestoreType(e.target.value);
    };

    const getPersonalUserInfo = () => {
        const userId = initialState!.currentUser!.id!;
        const domainId = initialState!.currentUser!.personalDomain!.domainId!;
        return {
            userId: userId,
            domainId: domainId,
        };
    };

    const onBackup = async () => {
        const info = getPersonalUserInfo();
        const res = await exportData(info);
        if (res.fail) {
            if (res.errorId !== 'err_opt_cancel') {
                message.errorIntl(res.errorId);
            }
        } else {
            message.successIntl('dataStorage.message.backup.succefully');
        }
    };

    const onRestore = async () => {
        const info = getPersonalUserInfo();
        const res = await importData({ ...info, overwrite: restoreType === 'overwrite' });
        if (res.fail) {
            if (res.errorId !== 'err_opt_cancel') {
                message.errorIntl(res.errorId);
            }
        } else {
            message.successIntl('dataStorage.message.restore.succefully');
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <div
                style={{
                    border: 'solid 1px #eee',
                    borderRadius: '5px',
                    width: '100%',
                    padding: '20px',
                }}
            >
                <div style={{ marginTop: '20px' }}>
                    <Text style={{ fontSize: '18px' }}>
                        <FormattedMessage id="dataStorage.message.backup.title" />
                    </Text>
                </div>
                <HubButton onClick={onBackup} style={{ width: '120px', margin: '20px 0' }}>
                    <FormattedMessage id="dataStorage.button.backup" />
                </HubButton>
            </div>
            <div
                style={{
                    border: 'solid 1px #eee',
                    borderRadius: '5px',
                    width: '100%',
                    padding: '20px',
                    marginTop: '10px',
                }}
            >
                <div
                    style={{
                        paddingTop: '10px',
                        paddingBottom: '20px',
                        borderBottom: 'solid 1px #eee',
                    }}
                >
                    <Text style={{ fontSize: '18px' }}>
                        <FormattedMessage id="dataStorage.message.restore.title" />
                    </Text>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f', margin: '0 5px' }} />
                    <Text style={{ fontSize: '12px' }}>
                        <FormattedMessage id="dataStorage.message.restore.tips" />
                    </Text>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Radio.Group value={restoreType} onChange={onRestoreRadioChanged}>
                        <Space direction="vertical">
                            <Radio value={'overwrite'}>
                                <FormattedMessage id="dataStorage.radio.restore.delete" />
                            </Radio>
                            <Radio value={'merge'}>
                                <FormattedMessage id="dataStorage.radio.restore.merge" />
                            </Radio>
                        </Space>
                    </Radio.Group>
                </div>

                <HubButton onClick={onRestore} style={{ width: '120px', margin: '20px 0' }}>
                    <FormattedMessage id="dataStorage.button.restore" />
                </HubButton>
            </div>
        </div>
    );
};

export default dataStorage;
