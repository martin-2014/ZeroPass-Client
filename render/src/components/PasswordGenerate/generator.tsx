import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { PasswordHistoryItem, postPasswordHistory } from '@/services/api/password';
import message from '@/utils/message';
import phrase, { SeparatorType } from '@/utils/passphrase/phrase';
import { HistoryOutlined, SyncOutlined } from '@ant-design/icons';
import { Copy } from '@icon-park/react';
import {
    Checkbox,
    Col,
    Divider,
    InputNumber,
    Radio,
    RadioChangeEvent,
    Row,
    Select,
    Space,
    Typography,
    Tooltip,
} from 'antd';
import generator from 'generate-password';
import owasp from 'owasp-password-strength-test';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import HubButton from '../HubButton';
import styles from './index.less';

type PasswordType = 'char' | 'phrase';
type PropsItem = {
    fillPassword?: (password: string) => void;
    styles?: {};
    onSwitch: () => void;
    close?: () => void;
    visible?: boolean;
    isWeb?: boolean;
};

const { Option } = Select;
const { Text } = Typography;

let type: PasswordType = 'char';

const PasswordGenerator = (props: PropsItem) => {
    const Intl = useIntl();
    const [password, setPassword] = useState('');
    const [charLength, setCharLength] = useState<number>(12);
    const [phraseLength, setPhraseLength] = useState<number>(3);
    const [charOptions, setCharOptions] = useState([
        'lowercase',
        'uppercase',
        'numbers',
        'symbols',
        'exclude',
    ]);
    const [level, setLevel] = useState<number>(0);
    const [separator, setSeparator] = useState<SeparatorType>('-');
    const [capitalize, setCapitalize] = useState(false);

    const createRandom = (length: number, options: string[]) => {
        length = length < 8 ? 8 : length;
        length = length > 60 ? 60 : length;
        const pass = generator.generate({
            length: length,
            numbers: options.includes('numbers'),
            uppercase: options.includes('uppercase'),
            lowercase: options.includes('lowercase'),
            symbols: options.includes('symbols'),
            exclude: options.includes('exclude') ? '1lI0o' : '',
            strict: true,
        });
        setLevel(100 - owasp.test(pass).errors.length * 20);
        setPassword(pass);
    };

    const createPhrase = (length: number, sep: SeparatorType, cap?: boolean) => {
        length = length < 3 ? 3 : length;
        length = length > 12 ? 12 : length;
        let pass = phrase(length, sep, cap);
        while (pass.length < 20) {
            pass = phrase(length, sep, cap);
        }
        let score = 80;
        if (length > 3) score = 100;
        if (cap) score = 100;
        if (sep == 'ns') score = 100;
        setLevel(score);
        setPassword(pass);
    };

    useEffect(() => {
        if (props.visible) createPassword();
    }, [props.visible]);

    const fillPassword = async () => {
        props.fillPassword?.(password);
        props.close?.();
        const params: PasswordHistoryItem = {
            password: await encryptPassword(password),
            source: 1,
            description: '',
        };
        postPasswordHistory(params);
    };

    const cryptoService = new TCryptoService();

    const encryptPassword = async (pass: string) => {
        return await cryptoService.encryptText(pass, true);
    };

    const onChange = (e: RadioChangeEvent) => {
        const v = e.target.value;
        type = v;
        createPassword();
    };

    const options = [
        { label: Intl.formatMessage({ id: 'password.use.number' }), value: 'numbers' },
        { label: Intl.formatMessage({ id: 'password.use.lowercase' }), value: 'lowercase' },
        { label: Intl.formatMessage({ id: 'password.use.upercase' }), value: 'uppercase' },
        { label: Intl.formatMessage({ id: 'password.use.symbols' }), value: 'symbols' },
        { label: Intl.formatMessage({ id: 'password.exclude.similar' }), value: 'exclude' },
    ];

    const createPassword = () => {
        if (type == 'char') {
            createRandom(charLength, charOptions);
        } else {
            createPhrase(phraseLength, separator, capitalize);
        }
    };

    const strengthBackground = () => {
        if (level > 60) {
            return '#8ce32f';
        } else if (level < 60) {
            return '#ff4e00';
        } else {
            return '#ffc600';
        }
    };

    const copyPassword = async () => {
        navigator.clipboard.writeText(password);
        message.success(Intl.formatMessage({ id: 'userProfile.divider.secretKey.copy.success' }));
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    padding: '0px 0 6px 0',
                    marginBottom: props.isWeb ? 5 : 0,
                }}
            >
                <div style={{ width: 30, marginLeft: -10 }}></div>
                <div style={{ flex: 1, textAlign: 'center', lineHeight: '30px' }}></div>
                <div style={{ width: 30, marginRight: -10 }}>
                    <div className={styles.switchButton} onClick={props.onSwitch}>
                        <Tooltip title={Intl.formatMessage({ id: 'password.history' })}>
                            <HistoryOutlined className={styles.switchIcon} />
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div>
                {props.isWeb ? (
                    <div className={styles.textArea}>
                        <div className={styles.label}>
                            <FormattedMessage id="password.generator" />
                        </div>

                        <div className={styles.text}>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <Text style={{}} ellipsis={{ tooltip: password }}>
                                    {password}
                                </Text>
                            </div>

                            <Space style={{ width: 50 }} size={15}>
                                <Tooltip title={Intl.formatMessage({ id: 'common.refresh' })}>
                                    <SyncOutlined onClick={createPassword} className={'zp-icon'} />
                                </Tooltip>
                                <Tooltip title={Intl.formatMessage({ id: 'common.copy' })}>
                                    <Copy
                                        className={'zp-icon'}
                                        theme="outline"
                                        size="16"
                                        onClick={copyPassword}
                                    />
                                </Tooltip>
                            </Space>
                        </div>
                    </div>
                ) : (
                    <div className={styles.input}>
                        <div style={{ flex: 1 }}>
                            <Text style={{ width: '260px' }} ellipsis={{ tooltip: password }}>
                                {password}
                            </Text>
                        </div>

                        <div style={{ width: 16, marginLeft: 5 }}>
                            <Tooltip title={Intl.formatMessage({ id: 'common.refresh' })}>
                                <SyncOutlined onClick={createPassword} className={'zp-icon'} />
                            </Tooltip>
                        </div>
                    </div>
                )}
            </div>
            <div style={{ margin: '12px 0 12px 0' }}>
                <div
                    style={{ backgroundColor: strengthBackground(), height: 3, width: `${level}%` }}
                ></div>
            </div>
            <div style={{ display: props.isWeb ? 'none' : '' }}>
                <HubButton width={84} style={{ margin: 'auto' }} onClick={fillPassword}>
                    {Intl.formatMessage({ id: 'password.use' })}
                </HubButton>
            </div>
            <Divider className={styles.divider} />

            <div className={styles.optionContainer}>
                <Radio.Group onChange={onChange} value={type} style={{ width: '100%' }}>
                    <Row>
                        <Col span={12}>
                            <Radio value="char">
                                <FormattedMessage id="password.random" />
                            </Radio>
                        </Col>
                        <Col span={12}>
                            <Radio value="phrase">
                                <FormattedMessage id="password.phrase" />
                            </Radio>
                        </Col>
                    </Row>
                </Radio.Group>
                <Divider className={styles.divider} />
                <div style={{ display: type == 'char' ? '' : 'none' }}>
                    <Space>
                        <div style={{ lineHeight: '28px', fontSize: props.isWeb ? 14 : 12 }}>
                            <FormattedMessage id="password.characters" />:
                        </div>
                        <InputNumber
                            size="small"
                            min={8}
                            max={60}
                            className={styles.inputNumber}
                            defaultValue={charLength}
                            onChange={(v) => {
                                setCharLength(v);
                                createRandom(v, charOptions);
                            }}
                        />
                    </Space>
                    <Divider className={styles.divider} />
                    <Checkbox.Group
                        defaultValue={charOptions}
                        value={charOptions}
                        onChange={(v) => {
                            if (v.length == 0 || (v.length == 1 && v.includes('exclude'))) {
                                return;
                            }
                            setCharOptions(v);
                            createRandom(charLength, v);
                        }}
                    >
                        <Space direction="vertical" size={props.isWeb ? 10 : 1}>
                            {options.map((item) => (
                                <Checkbox key={item.value} value={item.value}>
                                    {item.label}
                                </Checkbox>
                            ))}
                        </Space>
                    </Checkbox.Group>
                </div>
                <div style={{ display: type == 'phrase' ? '' : 'none' }}>
                    <Row>
                        <Col span={12}>
                            <Space>
                                <div
                                    style={{ lineHeight: '28px', fontSize: props.isWeb ? 14 : 12 }}
                                >
                                    <FormattedMessage id="password.words" />:
                                </div>
                                <InputNumber
                                    size="small"
                                    min={3}
                                    max={12}
                                    className={styles.inputNumber}
                                    defaultValue={phraseLength}
                                    onChange={(v) => {
                                        setPhraseLength(v);
                                        createPhrase(v, separator, capitalize);
                                    }}
                                />
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Space>
                                <div
                                    style={{ lineHeight: '28px', fontSize: props.isWeb ? 14 : 12 }}
                                >
                                    <FormattedMessage id="password.separator" />:
                                </div>
                                <Select
                                    size="small"
                                    defaultValue={separator}
                                    onChange={(v) => {
                                        setSeparator(v);
                                        createPhrase(phraseLength, v, capitalize);
                                    }}
                                    dropdownMatchSelectWidth={false}
                                    dropdownStyle={{ fontSize: 12 }}
                                    style={{ width: props.isWeb ? 100 : 82 }}
                                >
                                    <Option className={styles.option} value="-">
                                        <FormattedMessage id="password.hyphens" />
                                    </Option>
                                    <Option className={styles.option} value=" ">
                                        <FormattedMessage id="password.spaces" />
                                    </Option>
                                    <Option className={styles.option} value=".">
                                        <FormattedMessage id="password.periods" />
                                    </Option>
                                    <Option className={styles.option} value=",">
                                        <FormattedMessage id="password.commas" />
                                    </Option>
                                    <Option className={styles.option} value="_">
                                        <FormattedMessage id="password.underscores" />
                                    </Option>
                                    <Option className={styles.option} value="n">
                                        <FormattedMessage id="password.numbers" />
                                    </Option>
                                    <Option className={styles.option} value="ns">
                                        <FormattedMessage id="password.numbers.symbols" />
                                    </Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>
                    <Divider className={styles.divider} />
                    <Checkbox
                        onChange={(e) => {
                            setCapitalize(e.target.checked);
                            createPhrase(phraseLength, separator, e.target.checked);
                        }}
                    >
                        <FormattedMessage id="password.use.upercase" />
                    </Checkbox>
                </div>
            </div>
        </div>
    );
};

export default PasswordGenerator;
