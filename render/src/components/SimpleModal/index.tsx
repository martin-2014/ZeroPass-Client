import { Modal } from 'antd';
import styles from './index.less';
import { Space } from 'antd';
import { useIntl } from 'umi';
import { CloseOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import HubButton from '../HubButton';

interface PropItems {
    close?: () => void;
    onOk?: () => void;
    afterClose?: () => void;
    okText?: string | JSX.Element;
    cancelText?: string | JSX.Element;
    title?: string | JSX.Element;
    width?: number;
    closable?: boolean;
    children: JSX.Element;
    destroyOnClose?: boolean;
    visible?: boolean;
    className?: string;
    mask?: boolean;
    footer?: null | JSX.Element;
    footerLocation?: 'left' | 'right' | 'center';
    loading?: boolean;
    zIndex?: number;
    header?: JSX.Element;
}

const SimpleModal = (props: PropItems) => {
    const Intl = useIntl();
    const [visible, setVisible] = useState(false);

    const close = () => {
        if (props.close) {
            props.close();
        } else {
            setVisible(false);
        }
    };

    const afterClose = () => {
        if (props.afterClose) {
            props.afterClose();
        }
    };

    useEffect(() => {
        const visible = props.visible == false ? false : true;
        setVisible(visible);
    }, [props.visible]);

    return (
        <div className={styles.base}>
            <Modal
                visible={visible}
                closable={false}
                footer={null}
                mask={true}
                centered
                width={props.width ?? 530}
                title={null}
                destroyOnClose={props.destroyOnClose}
                maskStyle={{ position: 'absolute' }}
                className={`${styles.modal} ${props.className}`}
                zIndex={props.zIndex ?? 1005}
                afterClose={afterClose}
                getContainer={document.getElementById('root') || document.body}
            >
                <div className={styles.main}>
                    <div className={styles.headerWrapper}>
                        {props.header ? (
                            props.header
                        ) : (
                            <>
                                <div className={styles.header}>
                                    <div className={styles.title}>
                                        {props.title ? props.title : <></>}
                                    </div>
                                    <div className={styles.close}>
                                        {props.closable !== false ? (
                                            <span
                                                onClick={(e) => {
                                                    close();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <CloseOutlined />
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.body}>
                        <div className={styles.content}>{props.children}</div>
                        {props.footer !== null ? (
                            <div className={styles.footer}>
                                {props.footer !== undefined &&
                                    props.footer !== null &&
                                    props.footer}
                                {props.footer === undefined && (
                                    <Space style={{ margin: 'auto' }}>
                                        <HubButton width={100} type="default" onClick={close}>
                                            {props.cancelText
                                                ? props.cancelText
                                                : Intl.formatMessage({ id: 'common.cancel' })}
                                        </HubButton>
                                        <HubButton
                                            width={100}
                                            onClick={props.onOk}
                                            loadingVisible={props.loading}
                                        >
                                            {props.okText
                                                ? props.okText
                                                : Intl.formatMessage({ id: 'common.save' })}
                                        </HubButton>
                                    </Space>
                                )}
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SimpleModal;
