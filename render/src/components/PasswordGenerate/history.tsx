import SimpleModel from '@/components/SimpleModal';
import { useLocalTime } from '@/hooks/useLocalTime';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import {
    deletePasswordHistory,
    deletePasswordHistoryAll,
    getPasswordHistoryAll,
    PasswordHistoryItem,
} from '@/services/api/password';
import message from '@/utils/message';
import {
    ExclamationCircleOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    LeftOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { Copy } from '@icon-park/react';
import { Col, Dropdown, Menu, Row, Space, Spin, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import ScrollContainter from '../ScrollContainter';
import styles from './index.less';
import { Delete } from '@/Icons';

type PropsType = {
    id: number;
    password: string;
    type: string;
    createTime: string;
    visible?: boolean;
    delete: (id: number) => void;
};

const { Text } = Typography;

const ListItem = (props: PropsType) => {
    const Intl = useIntl();
    const [visible, setVisible] = useState(false);
    const [truePassword, setTruePassword] = useState('');
    const getTime = useLocalTime();

    useEffect(() => {
        if (props.visible) {
            (async function () {
                await decryptPassword();
                setVisible(true);
            })();
        } else {
            setVisible(false);
        }
    }, [props.visible]);

    const copyPassword = async () => {
        if (!truePassword) {
            await decryptPassword();
        }
        navigator.clipboard.writeText(truePassword);
        message.success(Intl.formatMessage({ id: 'activate.copy.success' }));
    };

    const visibleSwitch = async () => {
        if (!visible) {
            await decryptPassword();
        }
        setVisible(!visible);
    };

    const cryptoService = new TCryptoService();

    const decryptPassword = async () => {
        if (!truePassword) {
            const pass = await cryptoService.decryptText(props.password, true);
            setTruePassword(pass);
        }
    };

    return (
        <div className={styles.item}>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    {visible ? (
                        <div style={{ height: 28, lineHeight: '28px' }}>
                            <Text style={{ width: 220 }} ellipsis={{ tooltip: truePassword }}>
                                {truePassword}
                            </Text>
                        </div>
                    ) : (
                        <div style={{ height: 28, lineHeight: '28px' }}>
                            <MoreOutlined
                                style={{ fontSize: 25, lineHeight: '25px' }}
                                rotate={90}
                            />
                            <MoreOutlined
                                style={{ fontSize: 25, lineHeight: '25px', marginLeft: -2 }}
                                rotate={90}
                            />
                        </div>
                    )}
                </div>
                <Space style={{ width: 65 }} className={styles.action}>
                    <div>
                        {visible ? (
                            <Tooltip
                                title={
                                    <FormattedMessage id="vault.home.password.hide"></FormattedMessage>
                                }
                            >
                                <EyeOutlined className={'zp-icon'} onClick={visibleSwitch} />
                            </Tooltip>
                        ) : (
                            <Tooltip
                                title={
                                    <FormattedMessage id="vault.home.password.show"></FormattedMessage>
                                }
                            >
                                <EyeInvisibleOutlined
                                    className={'zp-icon'}
                                    onClick={visibleSwitch}
                                />
                            </Tooltip>
                        )}
                    </div>
                    <div>
                        <Tooltip title={<FormattedMessage id="common.copy" />}>
                            <Copy
                                className={'zp-icon'}
                                theme="outline"
                                size="16"
                                onClick={copyPassword}
                            />
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title={Intl.formatMessage({ id: 'common.menu.delete' })}>
                            <Delete className={'zp-icon'} onClick={() => props.delete(props.id)} />
                        </Tooltip>
                    </div>
                </Space>
            </div>
            <div>{props.type}</div>
            <div className="hubFontColorLow" style={{ fontSize: 12 }}>
                {getTime(props.createTime)}
            </div>
        </div>
    );
};

type HistoryProps = {
    onSwitch: () => void;
};

const PasswordHistory = (props: HistoryProps) => {
    const Intl = useIntl();
    const [data, setData] = useState<PasswordHistoryItem[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        getData();
    }, []);

    const sortItems = (items: PasswordHistoryItem[]) => {
        return items.sort((a, b) => {
            if (a.createTime! > b.createTime!) return -1;
            if (a.createTime! < b.createTime!) return 1;
            return 0;
        });
    };

    const getData = async () => {
        setLoading(true);
        const res = await getPasswordHistoryAll();
        if (!res.fail) {
            const d = sortItems(res.payload!);
            setData(d);
        }
        setLoading(false);
    };

    const clear = async () => {
        setLoading(true);
        setShowConfirm(false);
        const res = await deletePasswordHistoryAll();
        if (res.fail) {
            message.errorIntl(res.errorId);
        } else {
            setData([]);
            message.successIntl('common.delete.success');
        }
        setLoading(false);
    };

    const deleteOne = async (id: number) => {
        setLoading(true);
        const res = await deletePasswordHistory(id);
        if (res.fail) {
            message.errorIntl(res.errorId);
        } else {
            const tmp: PasswordHistoryItem[] = [];
            data.forEach((item, i) => {
                if (item.id !== id) tmp.push(item);
            });
            setData(tmp);
            message.successIntl('common.delete.success');
        }
        setLoading(false);
    };

    const menu = (
        <Menu style={{ borderRadius: 5, padding: '7px 0' }}>
            <Menu.Item key="0" className={styles.menItem}>
                <div onClick={() => setShowAll(!showAll)}>
                    {showAll ? (
                        <FormattedMessage id="password.hide.all" />
                    ) : (
                        <FormattedMessage id="password.show.all" />
                    )}
                </div>
            </Menu.Item>
            <Menu.Item key="1" className={styles.menItem}>
                <div onClick={() => setShowConfirm(true)}>
                    <FormattedMessage id="password.clear.history" />
                </div>
            </Menu.Item>
        </Menu>
    );

    const SourceMap = {
        1: Intl.formatMessage({ id: 'password.desktop.app' }),
        2: Intl.formatMessage({ id: 'password.plugin' }),
    };

    const getList = () => {
        const items: JSX.Element[] = [];
        data.forEach((item, i) => {
            let type = item.description ? item.description : SourceMap[item.source];
            items.push(
                <ListItem
                    id={item.id!}
                    visible={showAll}
                    type={type}
                    createTime={item.createTime!}
                    password={item.password}
                    delete={deleteOne}
                    key={item.id}
                />,
            );
            if (i < data.length - 1) {
                items.push(
                    <div
                        style={{
                            height: 1,
                            margin: '4px 0',
                            backgroundColor: 'rgba(168, 168,168,0.4)',
                        }}
                        key={i}
                    ></div>,
                );
            }
        });
        return items;
    };

    return (
        <div className={styles.history}>
            <div style={{ display: 'flex', padding: '0px 0 6px 0' }}>
                <div style={{ width: 30, marginLeft: -10 }}>
                    <div className={styles.switchButton} onClick={props.onSwitch}>
                        <LeftOutlined className={styles.switchIcon} />
                    </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', lineHeight: '30px' }}></div>
                <div style={{ width: 30, marginRight: -10 }}>
                    <Tooltip title={Intl.formatMessage({ id: 'menu.more.tips' })}>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <div className={styles.switchButton}>
                                <MoreOutlined className={styles.switchIcon} />
                            </div>
                        </Dropdown>
                    </Tooltip>
                </div>
            </div>
            <div className={styles.list}>
                <Spin spinning={loading} style={{ height: '100%' }}>
                    <ScrollContainter>
                        <div>{getList()}</div>
                    </ScrollContainter>
                </Spin>
            </div>
            <SimpleModel
                width={450}
                close={() => setShowConfirm(false)}
                visible={showConfirm}
                onOk={clear}
                okText={<FormattedMessage id="multiselect.clear" />}
            >
                <Row>
                    <Col span={3}>
                        <ExclamationCircleOutlined style={{ fontSize: '44px', color: '#009AFF' }} />
                    </Col>
                    <Col span={21}>
                        <div style={{ fontSize: 16 }}>
                            <FormattedMessage id="password.clear.title" />
                        </div>
                        <div className="hubFontColorLow">
                            <FormattedMessage id="password.clear.content" />
                        </div>
                    </Col>
                </Row>
            </SimpleModel>
        </div>
    );
};

export default PasswordHistory;
