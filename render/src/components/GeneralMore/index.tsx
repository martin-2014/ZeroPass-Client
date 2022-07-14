import MoreOne from '@icon-park/react/lib/icons/MoreOne';
import { Dropdown, Tooltip } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import { FormattedMessage, useModel } from 'umi';
import Menu, { MoreMenuItem } from './components/Menu';

type Props<T = any> = {
    data: T;
    menuRenders: MenuRender<T>[];
    menuKey: string;
    showPin?: boolean;
    extraAction?: React.ReactNode[];
};

export type MenuRender<T = any> = (data: T) => MoreMenuItem;

export default (props: Props) => {
    const [dropDownVisible, setDropDownVisible] = useState(false);
    const [menuItems, setMenuItems] = useState<MoreMenuItem[]>([]);
    const { moreMenu, setMoreMenu } = useModel('moreMenu');

    useEffect(() => {
        const menus = props.menuRenders.filter((f) => f !== undefined).map((f) => f!(props.data));
        const localMenu = moreMenu[props.menuKey];
        setMenuItems(
            localMenu
                ? menus.map((item) => {
                      if (localMenu.includes(item.key)) {
                          item.pinned = true;
                      }
                      return item;
                  })
                : menus,
        );
    }, [props.menuRenders, moreMenu]);

    const pinnedChange = (key: any, pinned: boolean) => {
        const tmp: MoreMenuItem[] = [];
        let localMenu = moreMenu[props.menuKey] ?? [];
        for (const item of menuItems) {
            if (item.key === key) {
                if (pinned) {
                    if (!localMenu.includes(key)) localMenu.push(key);
                } else {
                    localMenu = localMenu.filter((item) => item !== key);
                }
                item.pinned = pinned;
            }
            tmp.push(item);
        }
        setMoreMenu(props.menuKey, localMenu);
        setMenuItems(tmp);
    };

    const handleMoreChange = (visible: boolean) => {
        setDropDownVisible(visible);
    };

    const getAtions = useCallback(() => {
        if (menuItems.length === 0) return;
        let actions: React.ReactNode[] = [];
        props.extraAction?.map((item) => {
            actions.push(item);
        });
        const menuAction: MoreMenuItem[] = [];
        const localMenu = moreMenu[props.menuKey];
        if (localMenu) {
            localMenu.map((key) => {
                const menu = menuItems.find((item) => item.key === key);
                if (menu) menuAction.push(menu);
            });
        } else {
            menuItems.map((item) => {
                if (item.pinned) {
                    menuAction.push(item);
                }
            });
        }
        menuAction.map((item) => {
            const menu = (
                <div
                    key={item.key}
                    onClick={(e) => {
                        e.stopPropagation();
                        item.onClick?.();
                    }}
                    className="zp-icon"
                >
                    <Tooltip title={item.tooltip ?? item.label}>{item.icon}</Tooltip>
                </div>
            );
            actions.push(menu);
        });
        return actions.map((item, index) => {
            if (item) {
                return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        {item}
                    </div>
                );
            } else {
                return;
            }
        });
    }, [menuItems]);

    return (
        <div style={{ display: 'flex', width: 'auto' }}>
            <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                {props.showPin ? getAtions() : <></>}

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={<FormattedMessage id="menu.more.tips" />}>
                        <Dropdown
                            overlay={
                                <Menu
                                    visible={dropDownVisible}
                                    menus={menuItems}
                                    hiddenMenu={() => {
                                        handleMoreChange(false);
                                    }}
                                    pinnedChange={pinnedChange}
                                    showPin={props.showPin}
                                />
                            }
                            placement="bottomLeft"
                            trigger={['click']}
                            onVisibleChange={handleMoreChange}
                            visible={dropDownVisible}
                        >
                            <MoreOne
                                className="zp-icon"
                                style={{ fontSize: '20px' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        </Dropdown>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};
