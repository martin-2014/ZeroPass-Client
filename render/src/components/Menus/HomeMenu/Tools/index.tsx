import { FormattedMessage } from 'umi';
import type { MenuItem } from '../../index';
import { Typography } from 'antd';
import classNames from 'classnames';
import styles from '../index.less';
import { useIntl, history } from 'umi';

const { Text } = Typography;
const handleClick = (path: string) => {
    history.push(path);
};
const Tools = ({ data }: { data: MenuItem[] }) => {
    const intl = useIntl();
    return (
        <ul style={{ padding: 0, margin: '0 auto' }}>
            {data.map((item) => {
                return (
                    <li
                        className={classNames(
                            styles.item,
                            history.location.pathname === item.path
                                ? styles.itemActived
                                : styles.itemHover,
                        )}
                        onClick={() => {
                            handleClick(item.path!);
                        }}
                        key={item.path}
                    >
                        <div className={styles.icon}>{item.icon}</div>
                        <div className={styles.itemText}>
                            <Text
                                ellipsis={{
                                    tooltip: <FormattedMessage id={item.locale}></FormattedMessage>,
                                }}
                            >
                                {intl.formatMessage({
                                    id: item.locale,
                                })}
                            </Text>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default Tools;
