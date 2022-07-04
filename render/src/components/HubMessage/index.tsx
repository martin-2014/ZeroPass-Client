import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import {
    CloseCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import styles from './index.less';

declare type ConfigDuration = number;
declare type MessageNode = React.ReactNode;
declare type MessageIntlId = string | number | undefined;

let wrap: HTMLElement;

type DataType = MessageNode | MessageIntlId;

type MessageType = 'info' | 'warning' | 'success' | 'error' | 'warn';

const creatDom = (msg: DataType, type: MessageType, zIndex?: number, duration?: ConfigDuration) => {
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.setAttribute('id', 'hub-message');
    }
    document.body.appendChild(wrap);
    const div = document.createElement('div');
    wrap.appendChild(div);
    return ReactDOM.render(
        <Message
            rootDom={wrap}
            parentDom={div}
            data={msg}
            type={type}
            zIndex={zIndex}
            duration={duration}
        />,
        div,
    );
};

type MessageProps = {
    rootDom: HTMLElement;
    parentDom: Element | DocumentFragment;
    data: DataType;
    type: MessageType;
    zIndex?: number;
    duration?: ConfigDuration;
};

const Message = (props: MessageProps) => {
    const [show, setShow] = useState(true);

    const close = () => {
        if (props.parentDom && props.rootDom) {
            unmountComponentAtNode(props.parentDom);
            props.rootDom.removeChild(props.parentDom);
        }
    };

    const unmount = useMemo(() => {
        return () => {
            close();
        };
    }, [props.rootDom, props.parentDom]);

    useEffect(() => {
        let interval = props.duration ?? 5000;
        if (props.type === 'success') interval = props.duration ?? 3000;
        setTimeout(() => setShow(false), interval - 450);
        setTimeout(unmount, interval);
    }, [unmount]);

    const getIcon = () => {
        switch (props.type) {
            case 'error':
                return <CloseCircleOutlined className={styles.img} style={{ color: '#E26C6C' }} />;
            case 'success':
                return <CheckCircleOutlined className={styles.img} style={{ color: '#78C445' }} />;
            default:
                return (
                    <ExclamationCircleOutlined
                        className={styles.img}
                        style={{ color: '#516FFE' }}
                    />
                );
        }
    };

    return (
        <div
            className={`${styles.main} ${show ? styles.show : styles.hide}`}
            style={{ zIndex: props.zIndex ?? 1051 }}
        >
            <div className={styles.body}>
                <div className={styles.wrapper}>
                    <div className={styles.icon}>{getIcon()}</div>
                    <div className={styles.content}>
                        <div className={styles.text}>{props.data}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const hubmessage = {
    error: (msg: DataType, zIndex?: number, duration?: ConfigDuration) => {
        creatDom(msg, 'error', zIndex, duration);
    },
    warning: (msg: DataType, zIndex?: number, duration?: ConfigDuration) => {
        creatDom(msg, 'info', zIndex, duration);
    },
    success: (msg: DataType, zIndex?: number, duration?: ConfigDuration) => {
        creatDom(msg, 'success', zIndex, duration);
    },
    warn: (msg: DataType, zIndex?: number, duration?: ConfigDuration) => {
        creatDom(msg, 'info', zIndex, duration);
    },
    info: (msg: DataType, zIndex?: number, duration?: ConfigDuration) => {
        creatDom(msg, 'info', zIndex, duration);
    },
};

export default hubmessage;
