import { MenuItem } from '@/components/Menus';
import { history } from 'umi';
import IconItem from './components/IconItem';
import type { Icon } from '@icon-park/react/es/runtime';

const size = 32;

interface Props {
    route: MenuItem;
    getLocale: (path: string) => string | JSX.Element;
    getIcon: (name: string) => Icon;
}

export default (props: Props) => {
    const allItem = props.route.children?.find((item) => item.name === 'allItems');
    const routeName = props.route.name;

    const handleAllItemClick = (routeName: string) => {
        history.push(`/${routeName}/allItems`);
    };

    return (
        <IconItem
            containterStyle={{ paddingLeft: 24, paddingRight: 18, width: 102 }}
            navIcon={{
                icon: props.getIcon(allItem?.icon!),
                fill: '#4a93e7',
                size,
                text: props.getLocale(allItem?.path!),
            }}
            selected={history.location.pathname === `/${routeName}/allItems`}
            onClick={() => {
                handleAllItemClick(routeName);
            }}
        />
    );
};
