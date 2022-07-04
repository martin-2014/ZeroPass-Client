import { Space } from 'antd';
import { ButtonType } from 'antd/lib/button';
import { useState } from 'react';
import HubButton from '../HubButton';
import SimpleModal from '../SimpleModal';
interface NotificationActionButton {
    type?: ButtonType;
    text?: JSX.Element;
    style?: {};
    showLoading?: boolean;
}
export interface NotificationActionProps {
    actionTitle?: JSX.Element;
    actionBody?: JSX.Element;
    firstButton?: NotificationActionButton;
    firstButtonClick?: () => Promise<any>;
    secondButton?: NotificationActionButton;
    secondButtonClick?: () => Promise<any>;
    thirdButton?: NotificationActionButton;
    thirdButtonClick?: () => Promise<any>;
}

const ActionButton = (
    props: { config: NotificationActionButton; onClick: () => Promise<any> } & { style: {} },
) => {
    const { config, onClick, style, ...others } = props;
    const [loading, setLoading] = useState(false);
    const handleFirstBtnClick = async () => {
        setLoading(config.showLoading === true);
        if (config.showLoading === true) {
            await onClick();
        } else {
            onClick();
        }
        setLoading(false);
    };
    return (
        <HubButton
            width={75}
            loadingVisible={loading}
            type={config.type || 'default'}
            onClick={handleFirstBtnClick}
            style={style}
            {...others}
        >
            {config.text}
        </HubButton>
    );
};

export default (props: {
    visible: boolean;
    notification?: NotificationActionProps;
    onClose: () => void;
}) => {
    const { visible, notification, onClose } = props;
    return (
        <SimpleModal
            visible={visible}
            closable
            close={onClose}
            footer={
                <Space style={{}}>
                    {notification?.firstButton ? (
                        <ActionButton
                            config={notification.firstButton}
                            onClick={notification.firstButtonClick!}
                            style={{ ...notification.firstButton.style }}
                        ></ActionButton>
                    ) : (
                        <></>
                    )}
                    {notification?.secondButton ? (
                        <ActionButton
                            config={notification.secondButton}
                            onClick={notification.secondButtonClick!}
                            style={{ ...notification.secondButton.style }}
                        ></ActionButton>
                    ) : (
                        <></>
                    )}
                    {notification?.thirdButton ? (
                        <ActionButton
                            config={notification.thirdButton}
                            onClick={notification.thirdButtonClick!}
                            style={{ ...notification.thirdButton.style }}
                        ></ActionButton>
                    ) : (
                        <></>
                    )}
                </Space>
            }
            title={notification?.actionTitle}
        >
            <div style={{ margin: '30px 0', textAlign: 'center' }}>
                <span>{notification?.actionBody}</span>
            </div>
        </SimpleModal>
    );
};
