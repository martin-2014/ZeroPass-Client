import { OpenDefaultBrowser, OpenSuperBrowser, Delete, Edit } from '@/components/Actions';
import { Space, Tooltip } from 'antd';
import { MinusCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import { localStore } from '@/browserStore/store';
import { useModel } from 'umi';

interface PropsItem {
    recordId: number | string;
    containerId?: null | string;
    edit: (e: any) => void;
    deleteItem: (e: any) => void;
    display: boolean;
}

export default (props: PropsItem) => {
    const { superStatus } = useModel('superBrowser');
    const Intl = useIntl();
    const key = props.recordId.toString();

    let app;

    if (props.containerId) {
        app = (
            <OpenSuperBrowser
                type="manager"
                appId={props.recordId}
                containerId={props.containerId}
            />
        );
    } else {
        app = (
            <OpenDefaultBrowser
                type="manager"
                appId={props.recordId}
                domainId={localStore.currentDomainId}
                action="fill"
            />
        );
    }

    if (superStatus[key] === 1 || superStatus[key] === 2) {
        return <LoadingOutlined style={{ fontSize: 16,  opacity: 0.5 }} spin />;
    } else if (superStatus[key] === 0) {
        return (
            <Tooltip title={Intl.formatMessage({ id: 'vault.action.running' })}>
                <MinusCircleOutlined
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: 16, display: props.display ? '' : 'none', opacity: 0.5 }}
                />
            </Tooltip>
        );
    } else {
        return (
            <Space
                style={{ display: props.display ? '' : 'none', float: 'right', marginRight: 10 }}
                size={20}
            >
                {app}
                <Edit onClick={props.edit} />
                <Delete comfirm={props.deleteItem} />
            </Space>
        );
    }
};
