import { TreeSelect, Divider, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './index.less';
import AssignList from './AssignList';
import { FormattedMessage } from 'umi';
import ScrollContainter from '../ScrollContainter';

const { Text } = Typography;

export type AssignItem = {
    value: string;
    title: string | JSX.Element;
    label?: string | JSX.Element;
    disableCheckbox?: boolean;
    canAssign?: boolean;
    children?: AssignItem[];
};

export type AssignListItem = {
    value: string;
    title: string | JSX.Element;
    canAssign: boolean;
};

export type PropsType = {
    data: AssignItem[];
    selected: AssignListItem[];
    onChange: (value: AssignListItem[]) => void;
    width?: number;
    height?: number;
    edit?: boolean;
    disabled?: boolean;
    ableToAssign?: boolean;
    dropdownClassName?: string;
};

export const teamTitle = (title: string | JSX.Element) => {
    return (
        <div style={{ display: 'flex', gap: 2 }}>
            <div>
                <TeamOutlined />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <Text ellipsis={{ tooltip: title }}>{title}</Text>
            </div>
        </div>
    );
};

export const userTitle = (title: string | JSX.Element) => {
    return (
        <div style={{ display: 'flex', gap: 2 }}>
            <div>
                <UserOutlined />
            </div>
            <div style={{ overflow: 'hidden' }}>
                <Text ellipsis={{ tooltip: title }}>{title}</Text>
            </div>
        </div>
    );
};

export default (props: PropsType) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [data, setData] = useState<AssignItem[]>([]);
    const [childData, setChildData] = useState<{}>({});
    const [listData, setListData] = useState<AssignListItem[]>([]);

    const setMyListData = (data: AssignListItem[]) => {
        setListData(
            data.sort((a: AssignListItem, b: AssignListItem) => +b.canAssign - +a.canAssign),
        );
    };

    const unique = (values: any[]) => {
        const result: any[] = [];
        values.forEach((v) => {
            if (!result.includes(v)) result.push(v);
        });
        return result;
    };

    const treeItemParse = (selectedItems: AssignListItem[]) => {
        const data: AssignItem[] = [];
        const selectedData: string[] = [];
        props.data.forEach((item) => {
            if (item.children) {
                const tmp = {
                    value: `group-${item.value}`,
                    title: teamTitle(item.title),
                    label: item.title,
                    children: item.children.map((child) => {
                        const key = `${child.value}-${item.value}`;
                        const selected = selectedItems.find((i) => i.value === child.value);
                        if (selected) {
                            selectedData.push(key);
                        }
                        return {
                            value: key,
                            title: userTitle(child.title),
                            label: child.title,
                            disableCheckbox:
                                props.ableToAssign == false && selected?.canAssign ? true : false,
                        };
                    }),
                };
                data.push(tmp);
            } else {
                const key = item.value.toString();
                const selected = selectedItems.find((i) => i.value === item.value);
                if (selected) {
                    selectedData.push(key);
                }
                data.push({
                    value: key,
                    title: userTitle(item.title),
                    label: item.title,
                    disableCheckbox:
                        props.ableToAssign == false && selected?.canAssign ? true : false,
                });
            }
        });
        return { data: data, selectedData: selectedData };
    };

    useEffect(() => {
        const res = treeItemParse(props.selected);
        setSelected(res.selectedData);
        setData(res.data);
        const tmp = {};
        props.data.map((item) => {
            if (item.children) {
                item.children.forEach((child) => {
                    tmp[child.value] = child;
                });
            } else {
                tmp[item.value] = item;
            }
        });
        setChildData(tmp);
        setMyListData(props.selected);
    }, [props.data, props.selected]);

    useEffect(() => {
        props.onChange(listData);
    }, [listData]);

    const diff = (a: [], b: []) => {
        const targets: string[] = [];
        a.forEach((v) => {
            if (!b.includes(v) && !targets.includes(v)) {
                targets.push(v);
            }
        });
        b.forEach((v) => {
            if (!a.includes(v) && !targets.includes(v)) {
                targets.push(v);
            }
        });
        return targets;
    };

    const getItemById = (values: string[]) => {
        const result: string[] = [];
        props.data.forEach((item) => {
            if (item.children) {
                item.children.map((child) => {
                    const key = `${child.value}-${item.value}`;
                    if (values.includes(child.value.toString())) {
                        result.push(key);
                    }
                });
            } else {
                const key = item.value.toString();
                if (values.includes(item.value.toString())) {
                    result.push(key);
                }
            }
        });
        return result;
    };

    const changeList = (targets: string[], add: boolean) => {
        let tmp: AssignListItem[] = [];
        if (add) {
            targets.forEach((v) => {
                const item: AssignItem = childData[v];
                tmp.push({
                    value: item.value,
                    title: item.title,
                    canAssign: false,
                });
            });
            tmp = [...listData, ...tmp];
        } else {
            listData.forEach((item) => {
                if (!targets.includes(item.value)) {
                    tmp.push(item);
                }
            });
        }
        setListData(tmp);
    };

    const onChange = (value, labelList, extra) => {
        if (extra.checked) {
            const child_value = value.map((v) => v.split('-')[0]);
            const child_preValue = extra.preValue.map((v) => v.value.split('-')[0]);
            const targets = diff(child_value, child_preValue);
            const values = [...value, ...getItemById(targets)];
            setSelected(unique(values));
            changeList(targets, true);
        } else {
            const preValue = extra.preValue.map((v) => v.value);
            const targets = diff(value, preValue).map((v) => v.split('-')[0]);
            const tmp: string[] = [];
            value.forEach((v) => {
                if (!targets.includes(v.split('-')[0])) {
                    tmp.push(v);
                }
            });
            setSelected(tmp);
            changeList(targets, false);
        }
    };

    function deleteListItem(value: string) {
        const selectValues: string[] = [];
        const listItems: AssignListItem[] = [];
        selected.forEach((v) => {
            const vId = v.split('-')[0];
            if (vId !== value) {
                selectValues.push(v);
            }
        });
        setSelected(selectValues);
        listData.forEach((item) => {
            if (item.value != value) {
                listItems.push(item);
            }
        });
        setListData(listItems);
    }

    function changeRole(canAssign: boolean, value: string) {
        const listItems: AssignListItem[] = [];
        listData.forEach((item) => {
            if (item.value == value) {
                item.canAssign = canAssign;
            }
            listItems.push(item);
        });
        setMyListData(listItems);
    }

    const Placeholder = () => {
        return (
            <>
                {listData.length} <FormattedMessage id="vault.user.privilege.assigned" />
            </>
        );
    };

    return (
        <div className={styles.main}>
            <TreeSelect
                showSearch
                style={{ width: '100%' }}
                value={selected}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder={<FormattedMessage id="vault.user.privilege.searchAsignees" />}
                multiple
                treeNodeFilterProp="label"
                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                onChange={onChange}
                treeCheckable
                treeData={data}
                virtual={false}
                dropdownClassName={`${styles.dropdown} ${props.dropdownClassName}`}
                maxTagCount={0}
                maxTagPlaceholder={<Placeholder />}
                disabled={props.disabled}
                showArrow={true}
                allowClear={false}
            ></TreeSelect>
            <div className={styles.list}>
                <ScrollContainter>
                    <div>
                        {listData.map((item, index) => {
                            return (
                                <div key={item.value}>
                                    <AssignList
                                        item={item}
                                        delete={deleteListItem}
                                        changeRole={changeRole}
                                        disabled={props.disabled}
                                        isLast={listData.length == 1}
                                        ableToAssign={props.ableToAssign}
                                        dropdownClassName={props.dropdownClassName}
                                    />
                                    {index != listData.length - 1 ? (
                                        <Divider style={{ margin: '3px 0' }} />
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollContainter>
            </div>
        </div>
    );
};
