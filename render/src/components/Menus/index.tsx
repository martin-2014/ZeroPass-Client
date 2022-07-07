import HomeMenu from '@/components/Menus/HomeMenu';
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
    const personal = props.menuData.find((item) => item.name === 'personal');
    if (personal && personal.children) {
        if (pathname.indexOf('personal') > -1) {
            const menus = personal.children.find((item) => item.name === 'menus');
            if (menus) {
                return <HomeMenu {...menus}></HomeMenu>;
            }
        }
    }
    return <></>;
};
