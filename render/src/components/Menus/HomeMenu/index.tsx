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
    /* 
    
    
    

    const { initDataWhenSwitch } = useInitData();
    const { cleanDataWhenSwitch } = useCleanData();

    const getData = async (menuData: MenuItem[]) => {
        if (currentUser?.isOwner) {
            setTag('workassigned', menuData);
        } else {
            setTag('personal', menuData);
            if (currentUser?.domainId) setTag('workassigned', menuData);
        }
    };

    const getMenuLevelClass = (level: number) => {
        let levelClass = styles.menuSubArrowL1;
        switch (level) {
            case 2:
                levelClass = styles.menuSubArrowL2;
                break;
            case 3:
                levelClass = styles.menuSubArrowL3;
                break;
        }
        return levelClass;
    };

    const onSwitchDomain = async (id: number) => {
        HubPageLoading.show(false);
        const res = await switchDomain(id);
        if (!res.fail) {
            var cryptoService = new TCryptoService();
            await cryptoService.removeEnterpriseDataKeyCache();
            sessionStore.token = res.payload.token;
            localStore.currentDomainId = id;
            await cleanDataWhenSwitch();
            await initDataWhenSwitch(sessionStore.token);
            await cryptoService.preCacheDataKey(false);
            history.push('/');
        }
        HubPageLoading.hide();
    };

    const createWorkMenu = (item: MenuItem, level: number) => {
        const levelClass = getMenuLevelClass(level);
        return (
            <>
                <SubMenu
                    key={item.path}
                    className={`${styles.menuSubHover} ${levelClass}`}
                    style={{ marginLeft: -24 }}
                    title={
                        <div className={styles.subTitle}>
                            <Text ellipsis={{ tooltip: initialState?.currentUser?.domainName }}>
                                {initialState?.currentUser?.domainName}
                            </Text>
                        </div>
                    }
                >
                    {MenuContainer(item.children, level + 1)}
                </SubMenu>
                <MenuDivider />
            </>
        );
    };

    const createPersonalMenu = (item: MenuItem, level: number) => {
        const levelClass = getMenuLevelClass(level);
        return (
            <>
                <SubMenu
                    key={item.path}
                    className={`${styles.menuSubHover} ${levelClass}`}
                    style={{ marginLeft: -24 }}
                    title={
                        <div className={styles.subTitle}>
                            <Text ellipsis={{ tooltip: Intl.formatMessage({ id: item.locale }) }}>
                                <FormattedMessage id={item.locale} />
                            </Text>
                        </div>
                    }
                >
                    {MenuContainer(item.children, level + 1)}
                </SubMenu>
            </>
        );
    };
    useEffect(() => {
        getData(props.menuData);
    }, [props.menuData]);

    const MenuDivider = () => {
        return <Divider className={styles.divider} />;
    };

    const MenuContainer = (menuData: Menus['menuData'], level: number) => {
        if (menuData && menuData?.length > 0) {
            return menuData.map((item) => {
                if (item.children) {
                    if (item.name == 'workassigned') {
                        return createWorkMenu(item, level);
                    } else if (item.name == 'personal') {
                        return createPersonalMenu(item, level);
                    } else {
                        const levelClass = getMenuLevelClass(level);
                        return (
                            <SubMenu
                                key={item.path}
                                className={`${styles.menuSubHover} ${levelClass}`}
                                title={<FormattedMessage id={item.locale} />}
                                icon={item.icon}
                            >
                                {MenuContainer(item.children, level + 1)}
                            </SubMenu>
                        );
                    }
                }

                const Prefix = () => {
                    let content = <FormattedMessage id={item.locale} defaultMessage={item.name} />;
                    if (level == 3) {
                        content = (
                            <div>
                                <span
                                    style={{
                                        color: item.path.startsWith('/personal')
                                            ? '#A97BDA'
                                            : '#00b1ff',
                                        width: 18,
                                        marginLeft: 1,
                                    }}
                                >
                                    <Text style={{}} ellipsis={{ tooltip: item.name }}>
                                        <span style={{ paddingRight: 5 }}>#</span>
                                        {item.name}
                                    </Text>
                                </span>
                            </div>
                        );
                    }
                    return content;
                };

                return (
                    <Menu.Item
                        key={item.path}
                        icon={item.icon}
                        className={styles.menuItem}
                        onClick={() => {
                            handleClick(item.path!);
                        }}
                    >
                        <Prefix />
                    </Menu.Item>
                );
            });
        } else {
            return <></>;
        }
    };

    const getExpanNameIcon = (props: { children: []; isOpen: boolean; eventKey: string }) => {
        const domains = initialState?.currentUser?.domains.filter(
            (v) => v.domainId != initialState.currentUser?.domainId,
        );
        if (['/workassigned', '/personal'].includes(props.eventKey)) {
            if (props.eventKey == '/workassigned' && domains && domains.length > 0) {
                return <DomainSwitchMenu domains={domains ?? []} onSwitch={onSwitchDomain} />;
            } else {
                if (props.isOpen) {
                    return (
                        <span className={`${styles.expandIcon}`}>
                            <DownOutlined />
                        </span>
                    );
                } else {
                    return (
                        <span className={`${styles.expandIcon}`}>
                            <UpOutlined />
                        </span>
                    );
                }
            }
        } else {
            return <></>;
        }
    }; */
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
