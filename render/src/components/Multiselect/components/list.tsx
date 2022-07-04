import { useState, useEffect } from 'react';
import styles from '../index.less';
import { Col, Row, Typography, Switch } from 'antd';
import { Delete } from '@/Icons';
import { useIntl } from 'umi';

const { Text } = Typography;

type Item = {
    value: string | number;
    label: string;
    isOwner?: boolean;
    enable?: boolean;
    owners?: string[];
};
type Props = {
    item: Item;
    selected: (string | number)[];
    onChange: (e: Item) => void;
    deleteItem: (value: number | string) => void;
    edit: boolean;
    hiddenOwner?: boolean;
};
type Data = {
    data: string[];
};
export default ({ item, selected, onChange, deleteItem, edit, hiddenOwner }: Props) => {
    const [check, setCheck] = useState(item.isOwner);
    const intl = useIntl();
    const changeIsOwner = (e: boolean) => {
        setCheck(e);
        onChange(item);
    };
    useEffect(() => {
        setCheck(item.isOwner);
    }, [item.isOwner]);
    function Owner(data: Data) {
        const item = data.data;
        if (item && item.length > 1) {
            const owners = item.slice(1);
            return owners.map((owner) => {
                return (
                    <Row className={styles.item}>
                        <Col className={styles.label} span={12}></Col>
                        <Col span={6}>
                            <span>{owner}</span>
                        </Col>
                    </Row>
                );
            });
        } else {
            return <></>;
        }
    }

    const DeleteButton = () => {
        return (
            <span
                className={styles.delete}
                onClick={() => {
                    deleteItem(item.value);
                }}
            >
                <Delete className="zp-icon" style={{ display: edit ? '' : 'none', fontSize: 14 }} />
            </span>
        );
    };

    if (selected.includes(item.value)) {
        if (!hiddenOwner) {
            return (
                <>
                    <Row className={styles.item}>
                        <Col className={styles.label} span={12}>
                            <Text ellipsis={{ tooltip: true }}>{item.label}</Text>
                        </Col>
                        <Col span={6}>
                            {item.owners ? (
                                <span>{item.owners[0]}</span>
                            ) : (
                                <Switch
                                    title={intl.formatMessage({ id: 'multiselect.owner' })}
                                    size="small"
                                    checked={check}
                                    onChange={changeIsOwner}
                                    disabled={!edit || item.enable === false}
                                />
                            )}
                        </Col>
                        <Col span={6}>
                            <DeleteButton />
                        </Col>
                    </Row>
                    <Owner data={item.owners}></Owner>
                </>
            );
        } else {
            return (
                <Row className={styles.item}>
                    <Col className={styles.label} span={18}>
                        <Text ellipsis={{ tooltip: true }}>{item.label}</Text>
                    </Col>
                    <Col span={6}>
                        <DeleteButton />
                    </Col>
                </Row>
            );
        }
    } else {
        return <></>;
    }
};
