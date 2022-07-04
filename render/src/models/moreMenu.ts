import { useState, useEffect } from 'react';

type Item = string[];

type MenuStatus = {
    [k in string]: Item;
};

const menuKey = 'more-action-menu';

const DefaultActions = {
    '0': ['openBrowser', 'edit'],
    '1': ['edit'],
    '2': ['edit'],
    '3': ['edit'],
    '4': ['edit'],
    '5': ['edit'],
    '6': ['edit'],
};

const moreMenu = () => {
    const [moreMenu, updateMoreMenu] = useState<MenuStatus>({});

    const setMoreMenu = (key: string, v: Item) => {
        moreMenu[key] = v;
        localStorage.setItem(menuKey, JSON.stringify(moreMenu));
        updateMoreMenu({ ...moreMenu });
    };

    useEffect(() => {
        const data = localStorage.getItem(menuKey);
        let actions = DefaultActions;
        if (data) {
            actions = JSON.parse(data);
        } else {
            localStorage.setItem(menuKey, JSON.stringify(actions));
        }
        updateMoreMenu(actions);
    }, []);

    return { moreMenu, setMoreMenu };
};

export default moreMenu;
