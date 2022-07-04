import { Row, Col, Typography, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { history } from 'umi';
import BaseCard from '../BaseCard';
import styles from './index.less';

const { Text } = Typography;

interface PropItems {
    close?: () => void;
    title: JSX.Element;
    color: string;
    count: number;
    href: string;
    iconPath: string;
    loading?: boolean;
}

const CountCard = (props: PropItems) => {
    const [loading, setLoading] = useState(props.loading);
    const [count, setCount] = useState<number>(0);
    const [color, setColor] = useState<string>('#000');
    const [title, setTitle] = useState<JSX.Element>(<></>);

    const onClick = (e: MouseEvent) => {
        history.push(props.href);
    };

    useEffect(() => {
        setCount(props.count);
        setColor(props.color);
        setTitle(props.title);
        if (props.loading !== undefined) setLoading(props.loading);
    }, [props.title, props.color, props.count, props.loading]);

    return (
        <BaseCard loading={loading} onClick={onClick} title={{ background: color }} radius={5}>
            <Row style={{ height: '100%' }}>
                <Col span={5} className={styles.left}>
                    <img src={props.iconPath} style={{ height: 30 }} />
                </Col>
                <Col span={1} className={styles.middle}>
                    <Divider
                        style={{ height: '80%' }}
                        type="vertical"
                        className={styles.divider}
                    ></Divider>
                </Col>
                <Col span={18} className={styles.right}>
                    <div style={{ margin: 'auto 0' }}>
                        <div className={styles.title}>{title}</div>
                        <div>
                            <Text style={{ fontSize: '30px', color: color, lineHeight: '30px' }}>
                                {`${count}`.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,')}
                            </Text>
                        </div>
                    </div>
                </Col>
            </Row>
        </BaseCard>
    );
};

export default CountCard;
