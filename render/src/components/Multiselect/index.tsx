import { Card, Select, Divider, Row, Col, Typography } from 'antd';
import { FormattedMessage } from 'umi';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import styles from './index.less';
import List from './components/list';
import ScrollContainter from '../ScrollContainter';

const { Option } = Select;
const { Text } = Typography;
export interface ProsType {
    data: {
        value: string | number;
        label: string;
        isOwner?: boolean;
        enable?: boolean;
        owners?: string[];
    }[];
    selected: (string | number)[];
    onChange?: (value: []) => void;
    width?: number;
    height?: number;
    title: JSX.Element;
    switchTitle?: string;
    edit: boolean;
    hiddenOwner?: boolean;
    placeholder?: string;
    dropdownClassName?: string;
}

const MultiSelect: FC<ProsType> = (pros) => {
    let origin = pros.data;
    const [selected, setSelected] = useState<(string | number)[]>([]);
    const [searchValue, setSearchValue] = useState('');
    useEffect(() => {
        setSelected(pros.selected);
    }, [pros.selected]);
    function returnResult() {
        const result: [] = [];
        origin.forEach((item) => {
            if (selected.includes(item.value)) {
                result.push(item);
            }
        });
        pros.onChange?.(result);
    }

    useEffect(() => {
        returnResult();
    }, [selected]);

    function handleChange(values: []) {
        setSelected(values);
    }

    function handleSearch(value: string) {
        setSearchValue(value);
    }

    function selectAll() {
        const values: [] = [];
        if (!searchValue) {
            origin.forEach((item) => {
                values.push(item.value);
            });
        } else {
            origin.forEach((item) => {
                if (item.label.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {
                    values.push(item.value);
                }
            });
        }
        setSelected(values);
    }

    function selectInvert() {
        const value: [] = [];
        if (!searchValue) {
            origin.forEach((item) => {
                if (!selected.includes(item.value)) {
                    value.push(item.value);
                }
            });
        } else {
            origin.forEach((item) => {
                if (
                    !selected.includes(item.value) &&
                    item.label.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
                ) {
                    value.push(item.value);
                }
            });
        }
        setSelected(value);
    }

    function deleteItem(item) {
        const values: [] = [];
        selected.forEach((v) => {
            if (v !== item) {
                values.push(v);
            }
        });
        setSelected(values);
    }

    function deleteAll() {
        setSelected([]);
    }

    function changeIsOwner(item) {
        item.isOwner = !item.isOwner;
        returnResult();
    }

    return (
        <Card className={styles.main} style={{ width: `${pros.width}px`, border: 'none' }}>
            <div className={styles.body}>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    maxTagCount={0}
                    listHeight={128}
                    onChange={handleChange}
                    value={selected}
                    showArrow
                    optionFilterProp="label"
                    onSearch={handleSearch}
                    searchValue={searchValue}
                    disabled={!pros.edit}
                    placeholder={pros.placeholder}
                    onBlur={() => {
                        setSearchValue('');
                    }}
                    dropdownRender={(menu) => (
                        <div>
                            {menu}
                            <div className={styles.fooTer}>
                                <a onClick={selectAll}>
                                    <FormattedMessage id="multiselect.select.all" />
                                </a>
                                <a className={styles.invert} onClick={selectInvert}>
                                    <FormattedMessage id="multiselect.select.invert" />
                                </a>
                            </div>
                        </div>
                    )}
                    dropdownClassName={pros.dropdownClassName}
                >
                    {origin.map((item) => (
                        <Option key={item.value} value={item.value} label={item.label} title="">
                            <Text ellipsis={{ tooltip: item.label }}>{item.label}</Text>
                        </Option>
                    ))}
                </Select>
                <div className={styles.list}>
                    <Row style={{ marginBottom: '6px', fontWeight: 'bold' }}>
                        <Col span={12}>
                            <span style={{ marginLeft: '6px' }}>{pros.title}</span>
                        </Col>
                        <Col span={6}>{pros.switchTitle}</Col>
                        <Col span={6}></Col>
                    </Row>
                    <Divider className={styles.divider} />
                    <div className={styles.listContent}>
                        <ScrollContainter>
                            <>
                                {origin.map((item) => (
                                    <List
                                        key={item.value}
                                        item={item}
                                        selected={selected}
                                        deleteItem={deleteItem}
                                        onChange={changeIsOwner}
                                        edit={pros.edit}
                                        hiddenOwner={pros.hiddenOwner}
                                    />
                                ))}
                            </>
                        </ScrollContainter>
                    </div>
                </div>
                <div className={styles.footer} style={{ display: pros.edit ? '' : 'none' }}>
                    <a onClick={deleteAll}>
                        <FormattedMessage id="multiselect.clear" />
                    </a>
                </div>
            </div>
        </Card>
    );
};

export default MultiSelect;
