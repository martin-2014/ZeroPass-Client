import { Popover, PopconfirmProps, PopoverProps } from 'antd';
import HubButton from '@/components/HubButton';
import styles from './index.less';
import { Attention } from '@icon-park/react';
import { useState } from 'react';

type Props = Pick<PopconfirmProps, 'cancelText' | 'okText' | 'onCancel' | 'onConfirm'> &
    PopoverProps;

export default (props: Props) => {
    const { title, onCancel, onConfirm, okText, cancelText, style, ...rest } = props;
    const [visible, setVisible] = useState(false);
    const handleVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const Content = () => {
        return (
            <div className={styles.pop}>
                <div className={styles.wrapper}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.imgContent}>
                            <Attention theme="filled" size={18} fill="#5273fe" />
                        </div>
                        <div>
                            <span>{title}</span>
                        </div>
                    </div>
                    <div className={styles.btnWrapper}>
                        <HubButton
                            type="default"
                            onClick={(e) => {
                                onCancel?.(e);
                                setVisible(false);
                            }}
                            className={styles.btn}
                            style={{ marginRight: 10, height: 20 }}
                        >
                            {cancelText}
                        </HubButton>
                        <HubButton
                            onClick={(e) => {
                                onConfirm?.(e);
                                setVisible(false);
                            }}
                            style={{ height: 20 }}
                            className={styles.btn}
                        >
                            {okText}
                        </HubButton>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Popover
            visible={visible}
            onVisibleChange={handleVisibleChange}
            trigger="click"
            content={Content}
            {...rest}
            zIndex={1071}
        />
    );
};
