import { CloseSmall } from '@icon-park/react';
import { Drawer, Tooltip } from 'antd';
import styles from './index.less';
import { useIntl } from 'umi';

type Props = {
    title: string | React.ReactNode;
    visible: boolean;
    children: JSX.Element;
    onClose: () => void;
};

export default (props: Props) => {
    const Intl = useIntl();
    return (
        <Drawer
            visible={props.visible}
            className={styles.drawer}
            mask={false}
            style={{ position: 'absolute' }}
            width="100%"
            bodyStyle={{ padding: 0, margin: 0, overflow: 'hidden' }}
            closable={false}
            destroyOnClose={true}
            getContainer={document.getElementById('base-content-layout') || document.body}
        >
            <div className={styles.wrapper}>
                <div className={styles.titleContainter}>{props.title}</div>
                <div
                    onClick={(e) => {
                        props.onClose();
                        e.stopPropagation();
                    }}
                    className={styles.iconContainter}
                >
                    <Tooltip title={Intl.formatMessage({ id: 'common.close' })}>
                        <CloseSmall className="zp-icon-red" size={18} strokeWidth={6} />
                    </Tooltip>
                </div>
            </div>
            {props.children}
        </Drawer>
    );
};
