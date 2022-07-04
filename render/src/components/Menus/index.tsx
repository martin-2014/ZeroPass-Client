import { useModel } from 'umi';
import ManagementMenu from './ManagementMenu';
import HomeMenu from './HomeMenu';
export interface MenuItem {
    path?: string;
    locale: string;
    icon?: string;
    name: string;
    children?: MenuItem[];
    component?: (props: any) => JSX.Element;
}

interface Props {
    menuData: MenuItem[];
    location: {
        pathname: string;
    };
}
export default (props: Props) => {
    const pathname = props.location.pathname;
    const workassigned = props.menuData.find((item) => item.name === 'workassigned');
    if (workassigned && workassigned.children) {
        if (pathname.indexOf('adminconsole') > -1) {
            const menus = workassigned.children.find((item) => item.name === 'adminconsole');
            if (menus) {
                return <ManagementMenu {...menus}></ManagementMenu>;
            }
        } else if (pathname.indexOf('workassigned') > -1) {
            const menus = workassigned.children.find((item) => item.name === 'menus');
            if (menus) {
                return <HomeMenu {...menus}></HomeMenu>;
            }
        }
    }
    const personal = props.menuData.find((item) => item.name === 'personal');
    if (personal && personal.children) {
        if (pathname.indexOf('personal') > -1) {
            const menus = personal.children.find((item) => item.name === 'menus');
            if (menus) {
                return <HomeMenu {...menus}></HomeMenu>;
            }
        }
    }
};
