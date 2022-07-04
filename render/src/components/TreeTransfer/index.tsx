import { Select, Tree, Row, Col, Typography, Empty } from 'antd';
import styles from './index.less';
import { Delete } from '@/Icons';
import { useEffect, useReducer } from 'react';
import { cloneDeep } from 'lodash';
import { TreeNode } from 'antd/lib/tree-select';
import { FormattedMessage } from 'umi';

const { Text } = Typography;

const SUF = 's';
export type TreeNode = {
    title: string;
    key: string;
    children?: TreeNode[];
};

type InitialState = {
    treeData: TreeNode[];
    searchData: TreeNode[];
    tableData: TreeNode[];
    patchData: TreeNode[];
    selectedKeys: string[];
};
export type selectedKeys = {
    [key: string]: string[];
};
export type Props = {
    onChange: (e: selectedKeys) => void;
    selectedKeys: string[];
    Data: TreeNode[];
    height?: number | string;
    width?: number | string;
    edit: boolean;
};

const deleteTree = (tree: TreeNode[], select: string[], patchDatas: TreeNode[]) => {
    const patchData = cloneDeep(patchDatas);
    if (tree.length) {
        const treeData = tree.filter((node) => {
            const index = select.findIndex((s) => s === node.key);
            return index === -1;
        });
        let data = treeData.map((item) => {
            item.children = item.children?.filter((i) => {
                const index = select.findIndex((s) => s === i.key);
                return index === -1;
            });
            return item;
        });
        if (data.length) {
            for (let item of patchData) {
                const index = data.findIndex((s) => s.key === item.key);
                if (index === -1) {
                    data.push(item);
                } else {
                    const children = item.children as TreeNode[];
                    const dataChildren = data[index].children as TreeNode[];
                    data[index].children = [...dataChildren, ...children];
                }
            }
        } else {
            data = patchData;
        }
        if (data.length > 0) {
            data = data.filter((item) => item.children?.length > 0);
        }
        return data;
    } else {
        return patchData;
    }
};

const getTableData = (
    tree: TreeNode[],
    select: string[],
    tableDatas: TreeNode[],
    payload: number,
) => {
    let tableData: TreeNode[] = [];
    if (payload === 0) {
        tableData = [];
    } else {
        tableData = cloneDeep(tableDatas);
    }
    const treeData = [];
    for (let node of tree) {
        const index = select.findIndex((s) => s === node.key);
        if (index > -1) {
            const index = tableData.findIndex((s) => s.key === node.key);
            if (index === -1) {
                tableData.push(node);
            } else {
                let children = tableData[index].children as TreeNode[];
                children = [...children, ...(node.children as TreeNode[])];
                tableData[index].children = children;
            }
        } else {
            treeData.push(node);
        }
    }
    for (let parent of treeData) {
        for (let node of parent.children as TreeNode[]) {
            const index = select.findIndex((s) => s === node.key);
            if (index > -1) {
                const index = tableData.findIndex((s) => s.key === parent.key);
                index > -1
                    ? tableData[index].children?.push(node)
                    : tableData.push({
                          title: parent.title,
                          key: parent.key,
                          children: [node],
                      });
            }
        }
    }
    return tableData;
};

const deleteItem = (key: string, state: InitialState) => {
    const tableData = state.tableData;
    let data: TreeNode[] = cloneDeep(state.tableData);
    let patchData: TreeNode[] = cloneDeep(state.patchData);
    let patchNode: TreeNode;
    for (let index = 0; index < tableData.length; index++) {
        const tableItem = tableData[index];
        if (tableItem.key === key) {
            patchNode = cloneDeep(tableItem);
            data.splice(index, 1);
            break;
        }
        const children = tableItem.children as TreeNode[];
        for (let j = 0; j < children.length; j++) {
            if (children[j].key === key) {
                const d = children.slice(0, j);
                const f = children.slice(j + 1, children.length);
                const childrenData = [...d, ...f];
                data[index].children = childrenData;
                const node = {
                    ...tableItem,
                    children: [children[j]],
                };
                patchNode = node;
                break;
            }
        }
    }

    let flag = 0;
    patchData.map((item) => {
        if (item.key === patchNode.key) {
            const children = patchNode.children as TreeNode[];
            const sourceChildren = item.children as TreeNode[];
            item.children = [...sourceChildren, ...children];
            flag = 1;
        }
        return item;
    });
    if (!flag) {
        patchData.push(patchNode);
    }
    data = data.filter((item) => {
        const length = item.children?.length as number;
        return length > 0;
    });
    return {
        data,
        patchData,
    };
};
function reducer(state: InitialState, action: { type: string; payload?: any }) {
    switch (action.type) {
        case 'search':
            const treeDatas = state.treeData.filter(
                (item) =>
                    item.title.toLocaleLowerCase().indexOf(action.payload.toLocaleLowerCase()) > -1,
            );
            return { ...state, searchData: treeDatas };
        case 'deleteTree':
            const datas = deleteTree(state.treeData, state.selectedKeys, state.patchData);
            return {
                ...state,
                searchData: datas,
                treeData: datas,
                selectedKeys: [],
                patchData: [],
            };
        case 'getTableData':
            let tableData = getTableData(
                state.treeData,
                state.selectedKeys,
                state.tableData,
                action.payload,
            );
            return { ...state, tableData: tableData };
        case 'deleteItem':
            const { data, patchData } = deleteItem(action.payload, state);
            return { ...state, tableData: data, patchData };
        case 'check':
            return { ...state, selectedKeys: action.payload };
        case 'init':
            const treeData = getData(action.payload);
            return { ...state, treeData };
        default:
            throw new Error();
    }
}

const getData = (data: TreeNode[]) => {
    const treeNode = data.map((item) => {
        return {
            ...item,
            key: item.key + SUF,
        };
    });
    return treeNode;
};
export default (props: Props) => {
    let treeNode = getData(props.Data);
    const initialState = {
        treeData: treeNode,
        searchData: treeNode,
        tableData: [],
        patchData: [],
        selectedKeys: [],
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    const handleSearch = (value: string) => {
        dispatch({ type: 'search', payload: value });
    };

    const titleRender = (nodeData: TreeNode) => {
        return (
            <Row style={{ width: `${(props.width || 300) - 60}px` }}>
                <Col span={10}>
                    <Text ellipsis={true}>{nodeData.children ? nodeData.title : ''}</Text>
                </Col>
                <Col span={10}>
                    <Text ellipsis={true}>{nodeData.children ? '' : nodeData.title}</Text>
                </Col>
                <Col span={4}>
                    <Delete
                        style={{
                            fontSize: '17px',
                            cursor: 'pointer',
                            display: !props.edit ? 'none' : '',
                            paddingLeft: nodeData.children ? '28px' : '5px',
                            paddingTop: '2px',
                        }}
                        onClick={() => {
                            handleDelete(nodeData.key);
                        }}
                    />
                </Col>
            </Row>
        );
    };
    const handleDelete = (key: string) => {
        dispatch({ type: 'deleteItem', payload: key });
    };
    const handleDropdownVisibleChange = (e: boolean) => {
        if (e) {
            dispatch({ type: 'deleteTree' });
        } else {
            dispatch({ type: 'getTableData', payload: 1 });
        }
    };
    const handleCheck = (e: string[]) => {
        dispatch({ type: 'check', payload: e });
    };
    useEffect(() => {
        dispatch({ type: 'check', payload: props.selectedKeys });
        dispatch({ type: 'getTableData', payload: 0 });
    }, [props.selectedKeys]);
    useEffect(() => {
        dispatch({ type: 'init', payload: props.Data });
    }, [props.Data]);
    useEffect(() => {
        const selectKeys: selectedKeys = {};
        state.tableData.forEach((item) => {
            const key = item.key.replace(SUF, '');
            selectKeys[key] = [];
            item.children?.forEach((s) => {
                selectKeys[key].push(s.key);
            });
        });
        props.onChange(selectKeys);
    }, [state.tableData]);
    const render = () => {
        return (
            <Tree
                onCheck={handleCheck}
                className={styles.hiddenIcon}
                checkable
                height={+(props.height || 150)}
                multiple={false}
                treeData={state.searchData}
                blockNode={true}
                checkedKeys={state.selectedKeys}
                titleRender={(nodeData: TreeNode) => (
                    <div
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: (props.width || 300) - 100,
                        }}
                    >
                        <span>{nodeData.title}</span>
                    </div>
                )}
            ></Tree>
        );
    };

    return (
        <div style={{ width: `${props.width || 300}px` }}>
            <Select
                disabled={!props.edit}
                showSearch
                style={{ width: `${props.width || 300}px` }}
                dropdownRender={render}
                onSearch={handleSearch}
                onDropdownVisibleChange={handleDropdownVisibleChange}
                className={styles.selector}
            ></Select>
            <div className={styles.infoLine}>
                <Row style={{ paddingLeft: '30px', width: `${(props.width || 300) - 30}px` }}>
                    <Col span={11}>
                        <Text strong={true}>
                            <FormattedMessage
                                id="Authorize.group"
                                defaultMessage="Group"
                            ></FormattedMessage>
                        </Text>
                    </Col>
                    <Col span={11}>
                        <Text strong={true}>
                            <FormattedMessage
                                id="Authorize.members"
                                defaultMessage="Members"
                            ></FormattedMessage>
                        </Text>
                    </Col>
                    <Col span={2}>
                        <Text strong={true}></Text>
                    </Col>
                </Row>
            </div>
            <div style={{ padding: '0 1px' }}>
                <div
                    style={{
                        height: +(props.height || 150),
                        overflow: 'scroll',
                    }}
                    className={styles.list}
                >
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{
                            display: state.tableData.length > 0 ? 'none' : '',
                        }}
                    ></Empty>
                    <Tree
                        className={styles.hiddenIcon}
                        checkable={false}
                        multiple={false}
                        treeData={state.tableData}
                        blockNode={true}
                        titleRender={titleRender}
                    />
                </div>
            </div>
        </div>
    );
};
