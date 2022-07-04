import { getMergeStatus } from '@/services/api/synchronization';
import { SyncOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { FormattedMessage, useModel } from 'umi';
import SimpleModal from '../SimpleModal';
import SyncStatus from './SyncStatus';

const SyncDialogIcon = () => {
    const [showSyncDialog, setShowSyncDialog] = useState(false);
    const { setSyncInfo } = useModel('syncInfo');

    const onSyncClicked = () => {
        setShowSyncDialog(true);
    };

    const reFreshTag = async () => {
        const res = await getMergeStatus();
        if (res.fail || res.payload === undefined) {
            return;
        }

        const syncInfo = res.payload as Message.SyncInfoData;
        console.log(syncInfo, 'syncInfo');
        setSyncInfo(syncInfo);
    };

    useEffect(() => {
        reFreshTag();
        const timeId = setInterval(reFreshTag, 1000);
        return () => {
            clearInterval(timeId);
        };
    }, []);
    return (
        <div>
            <SyncOutlined onClick={(e) => onSyncClicked()} style={{ color: 'white' }} />
            <SimpleModal
                title={<FormattedMessage id="sync.title" />}
                visible={showSyncDialog}
                destroyOnClose
                close={() => setShowSyncDialog(false)}
                width={720}
                closable
                footer={null}
            >
                <SyncStatus close={() => setShowSyncDialog(false)} />
            </SimpleModal>
        </div>
    );
};

export default SyncDialogIcon;
