import { Down } from '@icon-park/react';
import { Dropdown, Typography, Tooltip } from 'antd';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import styles from './index.less';

type Props = {
    checked: boolean;
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
    className?: React.HTMLAttributes<HTMLDivElement>['className'];
    checkedStyle?: React.HTMLAttributes<HTMLDivElement>['style'];
    checkedClassName?: React.HTMLAttributes<HTMLDivElement>['className'];
    text: string[];
    overlay?: JSX.Element;
    menuVisible?: boolean;
    setMenuVisible?: (e: boolean) => void;
    onChange: (checked: Props['checked']) => void;
};

const { Text } = Typography;
export default (props: Props) => {
    const [ellipsis, setEllipsis] = useState(false);
    const ellipsisRef = useRef(false);
    const handleEllipsis = (ellipsis: boolean) => {
        ellipsisRef.current = ellipsis;
    };
    const handleMouseEnter = () => {
        setEllipsis(ellipsisRef.current);
    };
    const handleMouseLeave = () => {
        setEllipsis(false);
    };
    return (
        <div className={classNames(styles.switchIcon, props.className)} style={props.style}>
            <div
                className={classNames(
                    props.checked ? styles.SwitchIconSelect : styles.SwitchIconNoSelect,
                    props.checked ? props.checkedClassName : '',
                )}
                onClick={() => {
                    props.onChange(true);
                }}
                style={props.checked ? props.checkedStyle : {}}
            >
                {props.overlay ? (
                    <Dropdown
                        overlay={props.overlay}
                        visible={props.menuVisible}
                        onVisibleChange={props.setMenuVisible}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <div
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className={styles.dropDownWrapper}
                        >
                            <Tooltip title={props.text[0]} visible={ellipsis} placement="left">
                                <Text
                                    style={{ overflow: 'hidden' }}
                                    ellipsis={{ onEllipsis: handleEllipsis }}
                                >
                                    {props.text[0]}
                                </Text>
                            </Tooltip>
                            <Down style={{ display: props.checked ? '' : 'none' }} size={20}></Down>
                        </div>
                    </Dropdown>
                ) : (
                    <Text ellipsis={{ tooltip: props.text[0] }}>{props.text[0]}</Text>
                )}
            </div>
            <div
                className={classNames(
                    props.checked ? styles.SwitchIconNoSelect : styles.SwitchIconSelect,
                    props.checked ? '' : props.checkedClassName,
                )}
                onClick={() => {
                    props.onChange(false);
                }}
                style={props.checked ? {} : props.checkedStyle}
            >
                <Text ellipsis={{ tooltip: props.text[1] }}>{props.text[1]}</Text>
            </div>
        </div>
    );
};
