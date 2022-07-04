import { memo } from 'react';
import styles from '../index.less';
import { PushpinOutlined, PushpinFilled } from '@ant-design/icons';

export type MoreMenuItem = {
    icon: JSX.Element;
    label?: React.ReactNode;
    tooltip?: React.ReactNode;
    pinned?: boolean;
    onClick?: () => void;
    key: string;
};

export type Props<T = any> = {
    hiddenMenu: () => void;
    visible: boolean;
    menus: MoreMenuItem[];
    pinnedChange: (key: string, pinned: boolean) => void;
    showPin?: boolean;
};

const More = memo((props: Props) => {
    const { menus, pinnedChange, showPin } = props;

    return (
        <div className={styles.menu}>
            {menus.map((item, index) => {
                return (
                    <div key={item.key} style={{ display: 'flex' }} className={styles.menuItem}>
                        <div
                            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                props.hiddenMenu();
                                if (item.onClick) {
                                    item.onClick();
                                }
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </div>
                        <div
                            style={{ width: 22, paddingLeft: 5, display: showPin ? '' : 'none' }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {item.pinned ? (
                                <PushpinFilled
                                    rotate={-45}
                                    style={{ color: '#1d9cfd' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        pinnedChange(item.key!, false);
                                    }}
                                />
                            ) : (
                                <PushpinOutlined
                                    rotate={-45}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        pinnedChange(item.key!, true);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}, areEqual);

function areEqual(pre: Props, next: Props) {
    if (next.visible) {
        return false;
    }
    return true;
}

export default More;
