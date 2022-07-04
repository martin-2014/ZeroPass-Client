import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FormattedMessage } from 'umi';

export const HubEye = () => {
    return (
        <Tooltip title={<FormattedMessage id="vault.home.password.hide"></FormattedMessage>}>
            <EyeOutlined className={'zp-icon'} />
        </Tooltip>
    );
};

export const HubEyeInvisible = () => {
    return (
        <Tooltip title={<FormattedMessage id="vault.home.password.show"></FormattedMessage>}>
            <EyeInvisibleOutlined className={'zp-icon'} />
        </Tooltip>
    );
};
