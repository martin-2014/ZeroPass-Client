import type { Icon } from '@icon-park/react/es/runtime';
import { useEffect, useState } from 'react';
import styles from '../index.less';

export type NavIcon = {
    icon: Icon;
    fill: string;
    text: JSX.Element | string;
    size: number;
};
const defaultColor = '#fff';
const Item = (props: {
    navIcon: NavIcon;
    containterStyle?: React.HTMLAttributes<HTMLDivElement>['style'];
    contentStyle?: React.HTMLAttributes<HTMLDivElement>['style'];
    selected?: boolean;
    onClick?: React.DOMAttributes<HTMLDivElement>['onClick'];
}) => {
    const [fill, setFill] = useState(props.navIcon.fill);
    const [backgroundColor, setBackgroundColor] = useState(defaultColor);
    useEffect(() => {
        setFill(props.navIcon.fill);
    }, [props.navIcon.fill]);
    const handleMouseEnter = () => {
        if (!props.navIcon.fill) {
            return;
        }
        setFill(defaultColor);
        setBackgroundColor(props.navIcon.fill);
    };
    const handleMouseMove = () => {
        if (props.selected || !props.navIcon.fill) {
            return;
        }
        setFill(props.navIcon.fill);
        setBackgroundColor(defaultColor);
    };
    useEffect(() => {
        setFill(props.selected ? defaultColor : props.navIcon.fill);
        setBackgroundColor(props.selected ? props.navIcon.fill : defaultColor);
    }, [props.selected]);

    const handClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (fill) {
            props.onClick?.(e);
        }
    };
    return (
        <div style={{ flex: 1 }}>
            <div className={styles.iconContainter} style={props.containterStyle}>
                <div
                    className={styles.iconContent}
                    style={{
                        backgroundColor: backgroundColor,
                        ...props.contentStyle,
                        cursor: fill ? 'pointer' : 'default',
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseMove}
                    onClick={handClick}
                >
                    <props.navIcon.icon fill={fill || '#d6d6d6'} size={props.navIcon.size} />
                </div>
                <div
                    style={{
                        paddingTop: 12,
                        fontSize: 12,
                        textAlign: 'center',
                        userSelect: 'none',
                        lineHeight: 1.3,
                    }}
                >
                    <span>{props.navIcon.text}</span>
                </div>
            </div>
        </div>
    );
};

export default Item;
