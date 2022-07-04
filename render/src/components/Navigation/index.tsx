import { MenuItem } from '@/components/Menus';
import { Left, Right } from '@icon-park/react';
import { FormattedMessage, history, useModel } from 'umi';
import { IconMap } from '../MenuIcon';
import IconItem, { NavIcon } from './components/IconItem';
import styles from './index.less';

const size = 32;

let navIconSrc: (Pick<NavIcon, 'fill' | 'size'> & { route?: string })[] = [
    {
        fill: '#be94f0',
        size: size,
    },
    {
        fill: '#f77878',
        size: size,
    },
    {
        fill: '#f77878',
        size: size,
    },
    {
        fill: '#efb271',
        size: size,
    },
    {
        fill: '#b4d988',
        size: size,
    },
    {
        fill: '#efb271',
        size: size,
    },
];

export default (props: { route: MenuItem }) => {
    const { initialState } = useModel('@@initialState');
    const children = props.route.children?.find((item) => item.name === 'navigator')?.children!;
    const allItem = props.route.children?.find((item) => item.name === 'allItems');
    const adminConsole = props.route.children?.find((item) => item.name === 'adminconsole');
    const isAdminConsole = history.location.pathname.indexOf('adminconsole') > -1;
    const navIcons = navIconSrc.map((item, index) => {
        let fill = item.fill;
        if (!children[index].component) {
            fill = '';
        }
        const icon = getIcon(children[index].icon!);
        const text = getLocale(children[index].path!);
        const route = children[index].path;
        return {
            ...item,
            fill,
            icon,
            text,
            route,
        };
    });
    function getIcon(icon: string) {
        return IconMap[icon.replace('|icon', '')];
    }
    function getLocale(path: string) {
        const locale = 'menu' + path.replaceAll('/', '.');
        return <FormattedMessage id={locale} />;
    }

    const handleClick = (pathName: string) => {
        history.push(pathName);
    };

    const handleAllItemClick = (routeName: string) => {
        history.push(`/${routeName}/allItems`);
    };

    const handleAdminConsoleSelect = () => {
        if (!isAdminConsole) {
            history.push('/workassigned/adminconsole/dashboard');
        } else {
            history.push('/workassigned/menus/quickerfinder/favourites');
        }
    };
    const routeName = props.route.name;
    return (
        <div style={{ height: '100%', display: 'flex', paddingLeft: 22 }}>
            <div style={{ flex: 1, display: 'flex' }}>
                <div
                    style={{
                        flex: 0.062,
                        display: 'flex',
                    }}
                >
                    <div className={styles.circular}>
                        <Left theme="outline" size="28" fill="#BABBC2" />
                    </div>
                </div>
                <div style={{ flex: 0.876, display: 'flex' }}>
                    {navIcons.map((iconItem, index) => (
                        <IconItem
                            navIcon={iconItem}
                            selected={history.location.pathname === iconItem.route}
                            key={index}
                            onClick={() => {
                                handleClick(iconItem.route!);
                            }}
                        />
                    ))}
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'end',
                        flex: 0.062,
                    }}
                >
                    <div className={styles.circular}>
                        <Right theme="outline" size="28" fill="#BABBC2" />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <IconItem
                    containterStyle={{ paddingLeft: 24, paddingRight: 18, width: 102 }}
                    navIcon={{
                        icon: getIcon(allItem?.icon!),
                        fill: '#4a93e7',
                        size,
                        text: getLocale(allItem?.path!),
                    }}
                    selected={history.location.pathname === `/${routeName}/allItems`}
                    onClick={() => {
                        handleAllItemClick(routeName);
                    }}
                />
                <div style={{ marginRight: props.route.name === 'workassigned' ? 0 : 30 }}></div>
                <div
                    className={styles.line}
                    style={{ display: props.route.name === 'workassigned' ? '' : 'none' }}
                ></div>
                {props.route.name === 'workassigned' &&
                (initialState?.currentUser?.isAdmin || initialState?.currentUser?.isOwner) ? (
                    <IconItem
                        containterStyle={{
                            marginLeft: 5,
                            marginRight: 5,
                            width: 102,
                        }}
                        contentStyle={{ borderRadius: '50%' }}
                        navIcon={{
                            fill: '#4D62FE',
                            size,
                            text: getLocale(adminConsole?.path!),
                            icon: getIcon(adminConsole?.icon!),
                        }}
                        selected={isAdminConsole}
                        onClick={handleAdminConsoleSelect}
                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};
