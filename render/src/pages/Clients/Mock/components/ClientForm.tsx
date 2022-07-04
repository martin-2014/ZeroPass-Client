import styles from './index.less';
import {
    Button,
    Divider,
    Space,
    Form,
    Input,
    Checkbox,
    Row,
    Col,
    Radio,
    Select,
    Tooltip,
    Collapse,
    Switch,
} from 'antd';
import {
    CaretDownOutlined,
    CaretUpOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    QuestionCircleFilled,
} from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage, useModel } from 'umi';
import {
    clientList,
    updateClient,
    addClient,
    getClientUa,
    getClientLanguage,
    ipSearch,
} from '@/services/api/clients';
import pattern from '@/utils/pattern';
import UAParser from 'ua-parser-js';
import RightForm, { RightFormStatus } from '@/components/RightForm';
import HubButton from '@/components/HubButton';
import message from '@/utils/message';

const { Option } = Select;
const { Panel } = Collapse;

type props = {
    visible: boolean;
    cancel: () => void;
    id: number;
    reload: () => void;
    status: RightFormStatus;
};

type TestType = '' | 'yes' | 'no' | 'testing' | 'dup';

let country = '';
let realIp = '';
let timezone = '';
let gmt = '';
let attribution = '';
const defaultProxyType = 'https';

let Timestamp = 0;

export default (props: props) => {
    const Intl = useIntl();
    const [status, setStatus] = useState(props.status);
    const formRef = useRef(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [createTime, setCreateTime] = useState('');
    const [updateTime, setUpdateTime] = useState('');
    const [customOption, setCustomOption] = useState(false);
    const [testStatus, setTestStatus] = useState<TestType>('');
    const [uaLoading, setUaLoading] = useState(false);
    const [languageList, setLanguageList] = useState([]);
    const [panelStatus, setPanelStatus] = useState(false);
    const { initialState } = useModel('@@initialState');
    const [syncType, setSyncType] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [proxyChanged, setProxyChanged] = useState(false);
    const [showDescription, setShowDescription] = useState(true);
    const [footer, setFooter] = useState<JSX.Element>(<></>);

    const handleCancle = () => {
        props.cancel();
        setPanelStatus(false);
    };
    const visible = props.visible;
    const reload = props.reload;

    useEffect(() => {
        if (props.visible) {
            initLanguage();
            Timestamp = new Date().getTime();
            setTestStatus('');
            setStatus(props.status);
            if (props.status == 'new') {
                setShowDescription(false);
                reSet();
                setLoading(false);
            } else {
                setShowDescription(true);
                setLoading(true);
                getData();
                setProxyChanged(false);
            }
        }
    }, [props.visible, props.id, props.status]);

    const initLanguage = async () => {
        const res = await getClientLanguage();
        if (res && res.payload.length) {
            setLanguageList(res.payload);
            if (props.status == 'new') {
                form.setFieldsValue({ language: res.payload[0].name });
            }
        }
    };

    const handleEdit = () => {
        setStatus('edit');
    };

    const submitClick = async () => {
        await form
            .validateFields(['uaWindows'])
            .then(() => {})
            .catch(() => {
                setPanelStatus(true);
            });

        formRef.current?.submit();
    };

    const reSet = () => {
        form.setFieldsValue({ proxyType: defaultProxyType });
        form.setFieldsValue({ proxyAddress: '' });
        form.setFieldsValue({ proxyPort: '' });
        form.setFieldsValue({ proxyUser: '' });
        form.setFieldsValue({ proxyPassword: '' });
        form.setFieldsValue({ isStaticIp: true });

        form.setFieldsValue({ isCustomizedUA: false });
        // form.setFieldsValue({ isActive: true });
        form.setFieldsValue({ machineName: '' });
        form.setFieldsValue({ description: '' });
        form.setFieldsValue({ language: '' });

        form.setFieldsValue({ uaWindows: '' });
        // form.setFieldsValue({ uaMac: '' });
        // form.setFieldsValue({ ualinux: '' });
        setCustomOption(false);
        setPanelStatus(false);
        setSyncType(false);
        setIsActive(true);
        setCreateTime('');
        setUpdateTime('');
        realIp = '';
    };

    const cancleClick = () => {
        if (status == 'new') {
            reSet();
        }
        handleCancle();
    };

    const getProxy = (params) => {
        var proxy = {
            type: params.proxyType,
            ip: params.proxyAddress,
            port: params.proxyPort,
            username: params.proxyUser,
            password: params.proxyPassword,
            version: params.version ? params.version : 1,
        };
        return proxy;
    };

    const adjustProxy = (params) => {
        params.proxy = getProxy(params);
        delete params.proxyType;
        delete params.proxyAddress;
        delete params.proxyPort;
        delete params.proxyUser;
        delete params.proxyPassword;
    };

    const getData = async () => {
        const oldTimestamp = Timestamp;
        try {
            const res = await clientList({ id: props.id });
            const data = res.payload;
            if (oldTimestamp == Timestamp) {
                setCreateTime(data.createTime);
                setUpdateTime(data.updateTime);
                setCustomOption(data.isCustomizedUA);
                form.setFieldsValue({ proxyType: data.proxy.type });
                form.setFieldsValue({ proxyAddress: data.proxy.ip });
                form.setFieldsValue({ proxyPort: data.proxy.port });
                form.setFieldsValue({ proxyUser: data.proxy.username });
                form.setFieldsValue({ proxyPassword: data.proxy.password });
                form.setFieldsValue({ isStaticIp: !data.isDynamicalIp });

                // form.setFieldsValue({ isActive: data.isActive });
                form.setFieldsValue({ machineName: data.machineName });
                form.setFieldsValue({ description: data.description });
                form.setFieldsValue({ language: data.language });
                form.setFieldsValue({ uaWindows: data.uaWindows });
                // form.setFieldsValue({ uaMac: data.uaMac });
                // form.setFieldsValue({ uaLinux: data.uaLinux });
                setSyncType(data.isSyncCookieByUser);
                setIsActive(data.isActive);
                realIp = data.realIp;
                gmt = data.gmt;
                attribution = data.attribution;
                country = data.ipCountry;
                timezone = data.timeZone;
            }
        } catch (err: any) {
        } finally {
            setLoading(false);
        }
    };

    const optionChange = (e) => {
        setCustomOption(e.target.value == 'true' ? true : false);
    };
    const testConnect = async () => {
        const oldTimestamp = Timestamp;
        form.validateFields(['proxyAddress', 'proxyPort', 'proxyPassword', 'proxyUser'])
            .then(async (data) => {
                setTestStatus('testing');
                data.proxyType = form.getFieldValue('proxyType');
                const proxy = getProxy(data);
                proxy.version = Number(proxy.version);
                const result = await window.electron.checkProxyAsync(proxy);
                if (oldTimestamp != Timestamp) return;
                if (result.code === -1) {
                    setTestStatus('no');
                    return;
                }
                const userProfile = initialState?.currentUser!;
                const lang = userProfile.language === 'zh-CN' ? 'CN' : 'EN';
                const ipData = {
                    ip: result.msg,
                    lang,
                };
                const res = await ipSearch(ipData);
                if (res && res.error.id) {
                    message.errorIntl(res.error?.id);
                    setTestStatus('no');
                    return;
                }
                setTestStatus('yes');
                const payload = res.payload;
                timezone = payload.timezone;
                country = payload.country_Name;
                realIp = payload.ip;
                gmt = payload.gmt;
                attribution = `${payload.city}, ${payload.region}`;
                if (status == 'new') {
                    setShowDescription(true);
                    const system = getLocalSystem();
                    form.setFieldsValue({ machineName: `${system}-${country}-${realIp}` });
                    getUA();
                }
            })
            .finally(() => {
                if (testStatus == 'testing') setTestStatus('no');
            });
    };

    const getUA = async () => {
        setUaLoading(true);
        try {
            const res = await getClientUa();
            if (res && res.error?.id) {
                setLoading(false);
                message.errorIntl(res.error.id);
                return;
            } else {
                const data = res.payload.chrome;
                form.setFieldsValue({ uaWindows: data.windows });
                form.setFieldsValue({ uaMac: data.mac });
                form.setFieldsValue({ uaLinux: data.linux });
            }
        } catch {}

        setUaLoading(false);
    };

    const TestResult = (res) => {
        if (res.result == 'yes') {
            return (
                <div style={{ color: 'green' }}>
                    <div>
                        <FormattedMessage id="client.connect.success" />
                    </div>
                </div>
            );
        } else if (res.result == 'no') {
            return (
                <div style={{ color: '#ff4d4f' }}>
                    <FormattedMessage id="client.connect.fail" />
                </div>
            );
        } else if (res.result == 'dup') {
            return (
                <div style={{ color: '#ff4d4f' }}>
                    <FormattedMessage id="client.proxy.existed" />
                </div>
            );
        } else {
            return <></>;
        }
    };

    const getLocalSystem = () => {
        return 'Windows';
    };

    const validateIp = (rule: any, value: string, callback: (message?: string) => void) => {
        if (!(pattern.host.test(value) || pattern.ipv4.test(value) || pattern.ipv6.test(value))) {
            callback(Intl.formatMessage({ id: 'client.proxy.ip.format.error' }));
        } else {
            callback();
        }
    };

    const validateProxyChange = (e) => {
        setProxyChanged(true);
    };

    const validUserAgent = (rule: any, ua: string, callback: (message?: string) => void) => {
        const UAEngine = ['Blink', 'Gecko', 'WebKit', 'EdgeHTML', 'Trident', 'Presto'];
        const UAOS = [
            'Windows',
            'Linux',
            'Mac OS',
            'Fedora',
            '',
            'Android',
            'iOS',
            'Firefox OS',
            'Ubuntu',
        ];
        // 验证基本格式
        const bracketsReg = /\((.+?)\)/g;
        /**
         * ua有可能不是 xxx/xx.xx.xx的格式  直接是文字，所以这边没有必要限制的很死
         * 比如 (搜狗ua)
         * Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3314.0 Safari/537.36 SE 2.X MetaSr 1.0
         * 解析出来后面的几个 是 SE 2.X MetaSr 1.0
         */
        const uaItemReg = /^(\d?\.?\w)+[\/(\d\w-)+(\.(\d)+)]*$/;
        // 兼容IE 11 (like Gecko)
        const compatibleUA = ua
            .split(/(like Gecko)$/gi)[0]
            .replace(/(like Gecko\/(\d)+(\.(\d)+)*)/g, '');
        const removeBracketUA = compatibleUA.replace(bracketsReg, '');
        const uaItem = removeBracketUA.split(/ +/g).filter((item) => item !== '');
        const baseValidate = uaItem.every((item) => uaItemReg.test(item));

        // 验证 浏览器 内核 系统
        const instance = new UAParser(ua);
        const browser = instance.getBrowser().name;
        const engine = instance.getEngine().name;
        const OS = instance.getOS().name;
        if (
            baseValidate &&
            !!browser &&
            UAEngine.some((item) => item.toLowerCase() === engine?.toLowerCase()) &&
            UAOS.some((item) => item.toLowerCase() === OS?.toLowerCase())
        ) {
            callback();
        } else {
            callback(Intl.formatMessage({ id: 'client.ua.format.error' }));
        }
    };

    const validError = (type: string) => {
        form.validateFields([type]);
    };

    const handleFinish = async (params) => {
        setLoading(true);
        try {
            var clientInfo = window.electron.getClientInfo();
            params.clientOS = clientInfo.clientOS;
            params.clientVersion = clientInfo.clientVersion;
            params.clientMachineCode = clientInfo.clientMachineCode;
            params.gmt = gmt;
            params.attribution = attribution;
            params.realIp = realIp;
            params.ipCountry = country;
            params.timeZone = timezone;
            params.isCustomizedUA = customOption;
            params.isSyncCookieByUser = syncType;
            params.isDynamicalIp = !params.isStaticIp;
            params.isActive = isActive;
            adjustProxy(params);
            if (status !== 'new') {
                const res = await updateClient({
                    data: {
                        ...params,
                        id: props.id,
                    },
                });
                if (res && res.error?.id) {
                    setLoading(false);
                    if (res.error.id == 'err_machine_proxy_duplicate') setTestStatus('dup');
                    message.errorIntl(res.error?.id);
                    return;
                }
            } else {
                const res = await addClient({
                    data: {
                        ...params,
                    },
                });
                if (res && res.error?.id) {
                    setLoading(false);
                    if (res.error.id == 'err_machine_proxy_duplicate') setTestStatus('dup');
                    message.errorIntl(res.error.id);
                    return;
                }
                reSet();
            }
            message.success(Intl.formatMessage({ id: 'common.save.success' }));
            handleCancle();
            reload();
        } catch (err: any) {
            setLoading(false);
        }
    };

    useEffect(() => {
        let saveButton = <></>;
        if (testStatus == 'yes' || (status == 'edit' && !proxyChanged)) {
            saveButton = (
                <HubButton width={75} className={styles.button} onClick={submitClick}>
                    {Intl.formatMessage({ id: 'common.save' })}
                </HubButton>
            );
        } else {
            saveButton = (
                <HubButton
                    width={75}
                    loadingVisible={testStatus == 'testing'}
                    onClick={testConnect}
                    className={styles.button}
                >
                    {Intl.formatMessage({ id: 'client.test.connect' })}
                </HubButton>
            );
        }
        setFooter(
            <Space>
                <HubButton
                    width={75}
                    type="default"
                    className={styles.buttonCancel}
                    onClick={cancleClick}
                >
                    {Intl.formatMessage({ id: 'common.cancel' })}
                </HubButton>
                {saveButton}
            </Space>,
        );
    }, [testStatus, status, proxyChanged]);
    return (
        <RightForm
            visible={visible}
            loading={loading}
            onSave={submitClick}
            onCancel={cancleClick}
            onEdit={handleEdit}
            title={<FormattedMessage id="clients.machine" />}
            createTime={createTime}
            updateTime={updateTime}
            status={status}
            footer={footer}
        >
            <div>
                <Form
                    onFinish={handleFinish}
                    ref={formRef}
                    layout="vertical"
                    name="basic"
                    form={form}
                    autoComplete="off"
                    requiredMark={false}
                    size="small"
                    className={styles.clientForm}
                >
                    <div style={{ display: 'flex', marginBottom: 5 }}>
                        <div style={{ minWidth: 50, maxWidth: 150 }}>
                            <FormattedMessage id="pages.userTable.status" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Form.Item
                                name="isActive"
                                valuePropName="checked"
                                initialValue={true}
                                noStyle
                            >
                                <Switch
                                    disabled={status == 'view' || testStatus == 'testing'}
                                    size="small"
                                    checked={isActive}
                                    onChange={(v) => setIsActive(v)}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <Form.Item
                        className={styles.formItem}
                        label={<FormattedMessage id="client.proxy.type" />}
                        name="proxyType"
                        initialValue={defaultProxyType}
                    >
                        <Select
                            onChange={validateProxyChange}
                            disabled={
                                status == 'view' || testStatus == 'yes' || testStatus == 'testing'
                            }
                            dropdownClassName="rightFormDropDown"
                        >
                            <Option key="http" value="http">
                                Http
                            </Option>
                            <Option key="https" value="https">
                                Https
                            </Option>
                            <Option key="ssh" value="ssh">
                                Ssh
                            </Option>
                            <Option key="socks5" value="socks5">
                                Socks5
                            </Option>
                        </Select>
                    </Form.Item>
                    <div style={{ color: 'black' }}>
                        <FormattedMessage id="client.proxy.ip.and.port" />
                    </div>
                    <Row>
                        <Col span={17}>
                            <Form.Item
                                name="proxyAddress"
                                rules={[
                                    {
                                        required: true,
                                        message: <FormattedMessage id="client.proxy.ip.required" />,
                                    },
                                    { validator: validateIp, validateTrigger: 'onBlur' },
                                    {
                                        max: 50,
                                        message: <FormattedMessage id="limit.max.50" />,
                                    },
                                ]}
                                validateFirst={true}
                            >
                                <Input
                                    onChange={validateProxyChange}
                                    onBlur={() => validError('proxyAddress')}
                                    disabled={
                                        status == 'view' ||
                                        testStatus == 'yes' ||
                                        testStatus == 'testing'
                                    }
                                ></Input>
                            </Form.Item>
                        </Col>
                        <Col span={1} style={{ textAlign: 'center', color: 'black' }}>
                            :
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="proxyPort"
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage id="client.proxy.port.required" />
                                        ),
                                    },
                                    {
                                        pattern: pattern.port,
                                        message: (
                                            <FormattedMessage id="client.proxy.port.format.error" />
                                        ),
                                    },
                                ]}
                            >
                                <Input
                                    onChange={validateProxyChange}
                                    disabled={
                                        status == 'view' ||
                                        testStatus == 'yes' ||
                                        testStatus == 'testing'
                                    }
                                ></Input>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="proxyUser"
                                label={<FormattedMessage id="client.proxy.user" />}
                                rules={[
                                    {
                                        message: (
                                            <FormattedMessage id="client.proxy.user.required" />
                                        ),
                                    },
                                    {
                                        max: 128,
                                        message: <FormattedMessage id="limit.max.128" />,
                                    },
                                ]}
                                validateFirst={true}
                            >
                                <Input
                                    onChange={validateProxyChange}
                                    disabled={
                                        status == 'view' ||
                                        testStatus == 'yes' ||
                                        testStatus == 'testing'
                                    }
                                ></Input>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="proxyPassword"
                                label={<FormattedMessage id="client.proxy.password" />}
                                rules={[
                                    {
                                        message: (
                                            <FormattedMessage id="client.proxy.password.required" />
                                        ),
                                    },
                                    {
                                        max: 128,
                                        message: <FormattedMessage id="limit.max.128" />,
                                    },
                                ]}
                                validateFirst={true}
                                style={{
                                    backgroundColor:
                                        status == 'view' ||
                                        testStatus == 'yes' ||
                                        testStatus == 'testing'
                                            ? 'blaclk !important'
                                            : 'green !important',
                                }}
                            >
                                <Input.Password
                                    onChange={validateProxyChange}
                                    disabled={
                                        status == 'view' ||
                                        testStatus == 'yes' ||
                                        testStatus == 'testing'
                                    }
                                    iconRender={(visible) =>
                                        status == 'view' ||
                                        testStatus == 'yes' ||
                                        testStatus == 'testing' ? (
                                            <></>
                                        ) : visible ? (
                                            <EyeOutlined />
                                        ) : (
                                            <EyeInvisibleOutlined />
                                        )
                                    }
                                    style={{
                                        backgroundColor:
                                            status == 'view' ||
                                            testStatus == 'yes' ||
                                            testStatus == 'testing'
                                                ? 'blaclk !important'
                                                : 'green !important',
                                    }}
                                ></Input.Password>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item noStyle>
                        <TestResult result={testStatus} />
                        <div
                            style={{
                                color: 'blue',
                                display:
                                    realIp == '' || (status == 'edit' && testStatus != 'yes')
                                        ? 'none'
                                        : '',
                            }}
                        >
                            IP: {realIp};&nbsp; <FormattedMessage id="client.country" />: {country};
                            &nbsp; <FormattedMessage id="client.timezone" />: {timezone}
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="isStaticIp"
                        valuePropName="checked"
                        initialValue={true}
                        style={{
                            display:
                                realIp == '' || (status == 'edit' && testStatus != 'yes')
                                    ? 'none'
                                    : '',
                        }}
                    >
                        <Checkbox disabled={testStatus != 'yes'}>
                            <span style={{ color: '#303030' }}>
                                <FormattedMessage id="client.set.static.ip.pre" />
                                &nbsp;{realIp}&nbsp;
                                <FormattedMessage id="client.set.static.ip.suf" />
                            </span>
                        </Checkbox>
                    </Form.Item>
                    <Divider />

                    <div style={{ display: showDescription ? '' : 'none' }}>
                        <Collapse activeKey={panelStatus ? '1' : '2'} ghost>
                            <Panel
                                header={
                                    <div onClick={() => setPanelStatus(!panelStatus)}>
                                        <FormattedMessage id="clients.advanced.config" />
                                        {panelStatus ? <CaretUpOutlined /> : <CaretDownOutlined />}
                                    </div>
                                }
                                key="1"
                                showArrow={false}
                                forceRender={true}
                            >
                                <Row>
                                    <div style={{ width: 90 }}>UserAgent:</div>
                                    <div style={{ flex: 1 }}>
                                        <Radio.Group
                                            value={customOption ? 'true' : 'false'}
                                            onChange={optionChange}
                                        >
                                            <Radio
                                                value="false"
                                                disabled={
                                                    testStatus == 'testing' || status == 'view'
                                                }
                                            >
                                                <FormattedMessage id="client.option.default" />
                                            </Radio>
                                            <Radio
                                                value="true"
                                                disabled={
                                                    testStatus == 'testing' || status == 'view'
                                                }
                                            >
                                                <FormattedMessage id="client.option.custom" />
                                            </Radio>
                                        </Radio.Group>
                                    </div>
                                    <div style={{ width: 100 }}>
                                        <Button
                                            type="link"
                                            loading={uaLoading}
                                            style={{
                                                height: '27px',
                                                marginTop: '-5px',
                                                display: customOption ? 'none' : '',
                                                paddingLeft: 0,
                                            }}
                                            onClick={getUA}
                                            disabled={testStatus == 'testing' || status == 'view'}
                                        >
                                            <FormattedMessage id="client.get.ua" />
                                        </Button>
                                    </div>
                                </Row>
                                <Form.Item
                                    name="uaWindows"
                                    label={<FormattedMessage id="client.windows" />}
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage id="client.ua.windows.required" />
                                            ),
                                        },
                                        {
                                            validator: validUserAgent,
                                            validateTrigger: 'onBlur',
                                        },
                                        {
                                            max: 255,
                                            message: <FormattedMessage id="limit.max.255" />,
                                        },
                                        {
                                            pattern: /(^\S.{0,255}\S$)|(^\S$)/,
                                            message: (
                                                <FormattedMessage id="common.emptyCharacters" />
                                            ),
                                        },
                                    ]}
                                    validateFirst={true}
                                >
                                    <Input.TextArea
                                        onBlur={() => validError('uaWindows')}
                                        autoSize
                                        disabled={
                                            !customOption ||
                                            (customOption &&
                                                (testStatus == 'testing' || status == 'view'))
                                        }
                                    ></Input.TextArea>
                                </Form.Item>
                                <Row style={{ marginTop: '10px' }}>
                                    <div style={{ width: 180 }}>
                                        <FormattedMessage id="client.set.language" />:
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <Form.Item name="language">
                                            <Select
                                                disabled={
                                                    testStatus == 'testing' || status == 'view'
                                                }
                                                dropdownClassName="rightFormDropDown"
                                            >
                                                {languageList.map((item) => (
                                                    <Select.Option
                                                        value={item.name}
                                                        key={item.name}
                                                    >
                                                        <FormattedMessage
                                                            id={'client.set.language.' + item.name}
                                                        />
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </div>
                                </Row>
                                <Row>
                                    <div style={{ width: 55 }}>Cookie:</div>
                                    <div style={{ flex: 1 }}>
                                        <Space>
                                            <Radio.Group
                                                value={syncType ? 'true' : 'false'}
                                                onChange={(e) =>
                                                    e.target.value == 'true'
                                                        ? setSyncType(true)
                                                        : setSyncType(false)
                                                }
                                            >
                                                <Radio
                                                    value="true"
                                                    disabled={
                                                        testStatus == 'testing' || status == 'view'
                                                    }
                                                >
                                                    <FormattedMessage id="client.option.sync.user" />
                                                </Radio>
                                                <Radio
                                                    value="false"
                                                    disabled={
                                                        testStatus == 'testing' || status == 'view'
                                                    }
                                                >
                                                    <FormattedMessage id="client.option.sync.machine" />
                                                </Radio>
                                            </Radio.Group>
                                        </Space>
                                    </div>
                                </Row>
                            </Panel>
                        </Collapse>
                        <Divider />
                    </div>
                    <div style={{ display: showDescription ? '' : 'none' }}>
                        <Form.Item
                            name="machineName"
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage id="client.mock.description.required" />
                                    ),
                                },
                                {
                                    max: 50,
                                    message: <FormattedMessage id="limit.max.50" />,
                                },
                                {
                                    pattern: /(^\S.{0,255}\S$)|(^\S$)/,
                                    message: <FormattedMessage id="common.emptyCharacters" />,
                                },
                            ]}
                            validateFirst={true}
                            label={
                                <>
                                    <span style={{ color: 'red', verticalAlign: 'middle' }}>*</span>
                                    <FormattedMessage id="client.mock.description" />
                                    &nbsp;
                                    <Tooltip
                                        placement="top"
                                        title={
                                            <FormattedMessage id="client.mock.description.tips" />
                                        }
                                    >
                                        <QuestionCircleFilled />
                                    </Tooltip>
                                </>
                            }
                        >
                            <Input disabled={testStatus == 'testing' || status == 'view'}></Input>
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label={<FormattedMessage id="client.mock.long.description" />}
                            rules={[
                                {
                                    max: 255,
                                    message: <FormattedMessage id="limit.max.255" />,
                                },
                                {
                                    pattern: /(^\S.{0,255}\S$)|(^\S$)/,
                                    message: <FormattedMessage id="common.emptyCharacters" />,
                                },
                            ]}
                            validateFirst={true}
                        >
                            <Input.TextArea
                                autoSize={{ minRows: 2, maxRows: 5 }}
                                disabled={testStatus == 'testing' || status == 'view'}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </RightForm>
    );
};
