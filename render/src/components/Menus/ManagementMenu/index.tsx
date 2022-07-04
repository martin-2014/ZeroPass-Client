import classNames from 'classnames';
import type { FC } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import type { MenuItem } from '../index';
import styles from './index.less';
import { Typography } from 'antd';

const { Text } = Typography;
const ManagementMenu: FC<MenuItem> = (props) => {
    const intl = useIntl();
    const link = (path: string | undefined) => {
        if (path) {
            history.push(path);
        }
    };
    const children = props.children;
    if (children) {
        return (
            <ul className={styles.menuList}>
                {children.map((item) => {
                    return (
                        <li
                            className={classNames(
                                styles.menuItem,
                                history.location.pathname === item.path
                                    ? styles.menuItemActived
                                    : styles.menuItemHover,
                            )}
                            onClick={() => {
                                link(item.path);
                            }}
                            key={item.path}
                        >
                            <div className={styles.menuIconContent}>{item.icon}</div>
                            <div className={styles.itemText}>
                                <Text ellipsis={{ tooltip: <FormattedMessage id={item.locale} /> }}>
                                    {intl.formatMessage({ id: item.locale })}
                                </Text>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    } else {
        return <></>;
    }
};

export default ManagementMenu;
