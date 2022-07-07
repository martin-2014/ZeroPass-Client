import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Typography } from 'antd';
import { ButtonType } from 'antd/lib/button';
import { useLayoutEffect, useState } from 'react';
import styles from './index.less';
import classNames from 'classnames';

const { Text } = Typography;

type Props = {
    loadingVisible?: boolean;
    disable?: boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    children?: JSX.Element | string | React.ReactNode;
    type?: ButtonType;
    size?: 'small' | 'nomal' | 'big';
    style?: {};
    width?: number;
    height?: number;
    addonBefore?: JSX.Element;
} & React.HTMLAttributes<HTMLDivElement>;

const HubButton = (props: Props) => {
    const { onClick, disable, loadingVisible, children, className } = props;
    const [baseStyle, setBaseStyle] = useState({});

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (loadingVisible || disable) return;
        onClick?.(e);
    };

    const getClaseName = () => {
        const type = props.type ? props.type : 'primary';
        const clases = [styles[type]];
        if (!props.disable) {
            clases.push(styles[`${type}Hover`]);
        }
        return clases.join(' ');
    };

    useLayoutEffect(() => {
        let height = 26;
        if (props.height) {
            height = props.height;
        }
        let style = {
            height: height,
            borderRadius: height / 2,
            paddingLeft: height / 2,
            paddingRight: height / 2,
            fontSize: height > 26 ? 14 : 12,
        };
        if (props.disable)
            style = Object.assign(style, {
                opacity: '0.5',
                cursor: 'not-allowed',
            });
        if (props.loadingVisible) style = Object.assign(style, { cursor: 'wait' });
        if (props.width) style = Object.assign(style, { width: props.width });
        if (props.style) style = Object.assign(style, props.style);
        setBaseStyle(style);
    }, [props]);

    const extactTextFrom = (): any => {
        if (typeof children === 'string') {
            return { tooltip: children };
        }
        if (
            typeof children === 'object' &&
            children.props &&
            children.props.children &&
            Array.isArray(children.props.children)
        ) {
            let text = [];
            children.props.children.forEach((element) => {
                if (typeof element === 'string') text.push(element);
            });
            const extacted = text.join('').trim();
            if (extacted.length > 0) {
                return { tooltip: extacted };
            }
        }
        return undefined;
    };

    return (
        <div
            onClick={(e) => {
                handleClick(e);
            }}
            className={classNames(styles.disableTypography, `${getClaseName()}`, className)}
            style={{ ...baseStyle }}
        >
            {props.addonBefore && (
                <div style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
                    {props.addonBefore}
                </div>
            )}
            {loadingVisible ? (
                <Spin
                    indicator={
                        <LoadingOutlined
                            style={{
                                fontSize: '14px',
                                display: loadingVisible ? '' : 'none',
                                paddingRight: '8px',
                                margin: '0 2px 0 -8px',
                            }}
                        />
                    }
                ></Spin>
            ) : (
                <></>
            )}
            <div style={{ overflow: 'hidden' }}>
                <Text ellipsis={extactTextFrom()}>{children}</Text>
            </div>
        </div>
    );
};

export default HubButton;
