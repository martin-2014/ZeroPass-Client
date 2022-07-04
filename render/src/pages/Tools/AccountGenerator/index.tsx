import HubButton from '@/components/HubButton';
import useWindowSize from '@/hooks/useWindowSize';
import { generateEtherAccounts } from '@/services/api/wallet';
import message from '@/utils/message';
import { Copy } from '@icon-park/react';
import { Col, Form, Input, InputNumber, Row, Table, Tooltip, Typography } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import styles from './index.less';

type Account = {
    index: number;
    address: string;
    privateKey: string;
};

const MinIndex = 0;
const MaxIndex = 0xffffffff;
const MinCount = 1;
const MaxCount = 1000;
const IndexRange = `${MinIndex}-${MaxIndex}`;
const CountRange = `${MinCount}-${MaxCount}`;

export default () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const formRef = useRef<any>();
    const [form] = Form.useForm();
    const { height } = useWindowSize();
    const [loading, setLoading] = useState(false);
    const Intl = useIntl();

    const copyToClipboard = async (val: string) => {
        await navigator.clipboard.writeText(val);
        message.successIntl('common.copied');
    };

    const columns: ColumnType<Account>[] = [
        {
            width: '10%',
            ellipsis: true,
            dataIndex: 'index',
        },
        {
            title: Intl.formatMessage({ id: 'wallet.address' }),
            width: '45%',
            render: (value, record) => {
                return (
                    <div
                        className={styles.row}
                        style={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                        <span>{record.address}</span>
                        <Tooltip
                            title={Intl.formatMessage({ id: 'common.copy' })}
                            className={styles.icon}
                        >
                            <Copy
                                className={'zp-icon'}
                                size={18}
                                onClick={() => {
                                    copyToClipboard(record.address);
                                }}
                            />
                        </Tooltip>
                    </div>
                );
            },
        },
        {
            title: Intl.formatMessage({ id: 'wallet.privateKey' }),
            render: (value, record) => {
                return (
                    <div
                        className={styles.row}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            style={{
                                width: '93%',
                                overflow: 'hidden',
                            }}
                        >
                            <Typography.Text ellipsis={{ tooltip: record.privateKey }}>
                                {record.privateKey}
                            </Typography.Text>
                        </div>
                        <Tooltip
                            title={Intl.formatMessage({ id: 'common.copy' })}
                            className={styles.icon}
                        >
                            <Copy
                                className={'zp-icon'}
                                size={18}
                                onClick={() => {
                                    copyToClipboard(record.privateKey);
                                }}
                            />
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    const generateAccounts = async () => {
        setLoading(true);
        const values = form.getFieldsValue();
        const mnemonic = values['mnemonic'];
        const start = Number(values['start']);
        const count = Math.min(Number(values['count']), MaxIndex - start + 1);
        const result = await generateEtherAccounts(mnemonic, count, start);
        setAccounts(result);
        setLoading(false);
    };

    useEffect(() => {
        form.setFieldsValue({ count: 10, start: 0 });
    }, []);

    return (
        <div className={styles.body}>
            <div className={styles.title}>
                <FormattedMessage id="wallet.tool.mnemonicExport.title" />
            </div>
            <div className={styles.header}>
                <Form
                    ref={formRef}
                    form={form}
                    onFinish={generateAccounts}
                    validateMessages={{ required: '', whitespace: '' }}
                >
                    <Row className={styles.row}>
                        <Col flex="auto">
                            <div className={styles.label}>
                                <FormattedMessage id="wallet.tool.mnemonicExport.labelBIP39" />
                                {'*'}
                            </div>
                            <div>
                                <Form.Item
                                    name="mnemonic"
                                    rules={[{ required: true, whitespace: true }]}
                                >
                                    <Input style={{ width: '100%' }}></Input>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col flex={1}>
                            <div className={styles.label}>
                                <FormattedMessage id="wallet.tool.mnemonicExport.labelNumber" />
                                {'*'}
                            </div>
                            <div style={{ paddingRight: 35 }}>
                                <Form.Item name="count" rules={[{ required: true }]}>
                                    <InputNumber
                                        min={MinCount}
                                        max={MaxCount}
                                        placeholder={CountRange}
                                    ></InputNumber>
                                </Form.Item>
                            </div>
                        </Col>
                        <Col flex={1}>
                            <div className={styles.label}>
                                <FormattedMessage id="wallet.tool.mnemonicExport.labelStart" />
                                {'*'}
                            </div>
                            <div style={{ paddingRight: 35 }}>
                                <Form.Item name="start" rules={[{ required: true }]}>
                                    <InputNumber
                                        min={0}
                                        max={MaxIndex}
                                        placeholder={IndexRange}
                                    ></InputNumber>
                                </Form.Item>
                            </div>
                        </Col>
                        <Col flex={2}>
                            <div className={styles.buttomContainer}>
                                <HubButton
                                    width={120}
                                    onClick={() => {
                                        formRef.current?.submit();
                                    }}
                                >
                                    {Intl.formatMessage({ id: 'common.export' })}
                                </HubButton>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
            <div className={styles.content}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={accounts}
                    rowKey={(record) => {
                        return record.index.toString();
                    }}
                    pagination={{
                        defaultPageSize: 20,
                        total: accounts.length,
                        showTotal: (total, range) =>
                            Intl.formatMessage(
                                { id: 'pageOfTotalItems' },
                                { total: total, start: range[0], end: range[1] },
                            ),
                    }}
                    scroll={{ y: height - 470 }}
                ></Table>
            </div>
        </div>
    );
};
