import SwitchIcon from '@/components/SwitchIcon';
import useTagList from '@/hooks/useTagList';
import { Menu, Typography } from 'antd';
import classNames from 'classnames';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, history, useIntl, useModel } from 'umi';
import type { MenuItem } from '../index';
import styles from './index.less';
import Tags from './Tags';
import Tools from './Tools';

const { Text } = Typography;
const { SubMenu } = Menu;

const MenuTools = ({
    style,
    title,
    props,
}: {
    props: MenuItem;
    title: string | React.ReactNode;
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
}) => {
    const Header = (
        <div className={styles.headerContainter}>
            {/* <div className={styles.header}>{title}</div>
            <Down size={18} fill="#949494"></Down> */}
        </div>
    );
    const children = props.children;
    if (children) {
        const data = children.find((item) => item.name === 'tools');
        if (data?.children) {
            return (
                <div style={style} className={styles.Wrapper}>
                    {Header}
                    <Tools data={data.children} />
                </div>
            );
        }
    }
    return <div style={style}>{Header}</div>;
};
const HomeMenu: FC<MenuItem> = (props) => {
    const [quickFinder, setQuickFinder] = useState(true);
    const Intl = useIntl();
    const { setTag } = useTagList();
    const { tags: taglist } = useModel('tags');
    const { initialState } = useModel('@@initialState');
    const currentUser = initialState?.currentUser;
    const quickerfinder = props.children?.find((item) => item.name === 'quickerfinder');
    const tools = props.children?.find((item) => item.name === 'tools');
    const tags = quickerfinder?.children?.find((item) => item.name === 'tags');
    useEffect(() => {
        if (currentUser?.isOwner) {
            setTag('workassigned');
        } else {
            setTag('personal');
            if (currentUser?.domainId) {
                setTag('workassigned');
            }
        }
    }, []);

    const handleClick = (path: string) => {
        history.push(path);
    };

    const QuickFinder = useCallback(
        ({ style }: { style?: React.HTMLAttributes<HTMLDivElement>['style'] }) => {
            const favourites = quickerfinder?.children?.find((item) => item.name === 'favourites');

            return (
                <div className={styles.Wrapper} style={style}>
                    <div className={styles.favouritesWrapper}>
                        <div
                            className={classNames(
                                styles.favouritesContainter,
                                history.location.pathname === favourites?.path
                                    ? styles.favouritesContainterActived
                                    : styles.favouritesContainterHover,
                            )}
                            onClick={() => {
                                handleClick(favourites?.path!);
                            }}
                        >
                            {favourites?.icon}
                            <div className={styles.favouritesContent}>
                                <span>
                                    <FormattedMessage id={favourites?.locale}></FormattedMessage>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.line}></div>
                    <Tags
                        icon={tags?.icon}
                        title={<FormattedMessage id={tags?.locale}></FormattedMessage>}
                    ></Tags>
                </div>
            );
        },
        [],
    );
    return (
        <div className={styles.menu}>
            <SwitchIcon
                text={[
                    Intl.formatMessage({ id: quickerfinder?.locale }),
                    Intl.formatMessage({ id: tools?.locale }),
                ]}
                checked={quickFinder}
                onChange={(checked) => {
                    setQuickFinder(checked);
                }}
                style={{
                    background: '#e9ebf2',
                    color: 'black',
                    width: 183,
                    letterSpacing: '-0.2px',
                }}
                checkedClassName={styles.switchIcon}
            ></SwitchIcon>
            <MenuTools
                props={props}
                title={<FormattedMessage id={tools?.locale} />}
                style={{
                    display:
                        quickFinder ||
                        (!initialState?.currentUser?.isAdmin &&
                            history.location.pathname.indexOf('workassigned') > -1)
                            ? 'none'
                            : '',
                }}
            ></MenuTools>
            <QuickFinder style={{ display: quickFinder ? '' : 'none' }}></QuickFinder>
        </div>
    );
    /* return (
        <MenuFrame>
            <div className={`${styles.menuContainer} ${styles.menu}`}>
                <Menu
                    expandIcon={getExpanNameIcon}
                    mode="inline"
                    defaultOpenKeys={[
                        '/workassigned',
                        '/personal',
                        '/workassigned/tag',
                        '/personal/tag',
                    ]}
                    defaultSelectedKeys={['/workassigned/favourites', '/personal/favourites']}
                    selectedKeys={[props.location.pathname]}
                >
                    {MenuContainer(menuData!, 1)}
                </Menu>
            </div>
        </MenuFrame>
    ); */
};
export default HomeMenu;
