import styles from './index.less';
import { Form, Input, Row, Col, Typography, Tabs, Radio, Space, Select, Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useRef, useEffect } from 'react';
import {
    AppDetail,
    getUserAndGroup,
    AccessItem,
    updateLogin,
    createLogin,
    getLoginDetail,
} from '@/services/api/logins';
import { bindClientList, MachineItem } from '@/services/api/clients';
import { useIntl, FormattedMessage, useModel } from 'umi';
import pattern from '@/utils/pattern';
import Tag, { Option as TagOption } from './Tag';
import { errHandlers } from '@/services/api/errHandlers';
import { getVaultTags } from '@/services/api/tag';
import AssignSelect, { AssignItem, AssignListItem } from '@/components/AssignSelect';
import RightForm, { RightFormStatus } from '@/components/RightForm';
import useTagList from '@/hooks/useTagList';
import message from '@/utils/message';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { VaultItem } from '@/services/api/vaultItems';

const { TabPane } = Tabs;

const { Option } = Select;
const { Text } = Typography;

type props = {
    visible: boolean;
    cancel: () => void;
    id: number;
    status: RightFormStatus;
    reload: () => void;
};

let Timestamp = 0;

export default (props: props) => {
    const Intl = useIntl();
    const [status, setStatus] = useState<RightFormStatus>(props.status);
    const formRef = useRef(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [createTime, setCreateTime] = useState('');
    const [updateTime, setUpdatedTime] = useState('');
    const [machines, setMachines] = useState<MachineItem[]>([]);
    const [selectedValue, setSelectedValue] = useState(-1);
    const [isAnyMachine, setIsAnyMachine] = useState(true);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [options, setOptions] = useState<TagOption[]>([]);
    const [assignData, setAssignData] = useState<AssignItem[]>([]);
    const [assignSelected, setAssignSelected] = useState<AssignListItem[]>([]);
    const [assignOriginSelected, setAssignOriginSelected] = useState<AssignListItem[]>([]);

    const { initialState } = useModel('@@initialState');
    const { clearWorkAssignedTagMenuCache } = useTagList();

    const handleCancle = props.cancel;
    const visible = props.visible;
    const reload = props.reload;
    const handleEdit = () => {
        setStatus('edit');
    };
    const submitClick = () => {
        formRef.current?.submit();
    };
    const getTagData = async () => {
        const res = await getVaultTags();
        if (res.fail) {
            errHandlers.default(res);
        } else {
            const options = res.payload?.map((item) => ({
                id: item.id,
                value: item.name,
            }))!;
            setOptions(options);
        }
    };
    const reSet = (entry?: AppDetail) => {
        setCreateTime(entry?.createTime || '');
        setUpdatedTime(entry?.updateTime || '');
        form.setFieldsValue({ description: entry?.description || '' });
        form.setFieldsValue({ loginUri: entry?.loginUri || '' });
        form.setFieldsValue({ loginUser: entry?.loginUser || '' });
        form.setFieldsValue({ loginPassword: entry?.loginPassword || '' });
        setIsAnyMachine(!entry?.clientMachineId);
        setSelectedValue(entry?.clientMachineId);
    };

    const cancleClick = () => {
        if (status == 'new') {
            reSet();
        }
        handleCancle();
    };

    const handleFinish = async (e: VaultItem) => {
        setLoading(true);
        const clientMachineId = isAnyMachine ? null : selectedValue;
        const tagIds = tagList.map((item) => item.id);
        const access: AccessItem[] = assignSelected.map((item) => {
            return {
                userId: +item.value,
                canAssign: item.canAssign,
            };
        });

        var cryptoService = new TCryptoService();
        e.loginPassword = await cryptoService.encryptText(e.loginPassword, false);
        if (props.status != 'new') {
            const res = await updateLogin({
                ...e,
                id: props.id,
                clientMachineId: clientMachineId,
                tagIds: tagIds,
                accesses: access,
            });
            if (res.fail) {
                setLoading(false);
                message.errorIntl(res.errorId);
                return;
            }
            clearWorkAssignedTagMenuCache();
        } else {
            const res = await createLogin({
                ...e,
                clientMachineId: clientMachineId,
                tagIds: tagIds,
                accesses: access,
            });
            if (res.fail) {
                setLoading(false);
                message.errorIntl(res.errorId);
                return;
            }
            if (tagIds?.length > 0) {
                clearWorkAssignedTagMenuCache();
            }
            reSet();
        }
        message.success(Intl.formatMessage({ id: 'common.save.success' }));
        setLoading(false);
        handleCancle();
        reload();
    };
    const loadMachines = async () => {
        const list = await bindClientList();
        if (list.fail) return;
        const data = [];
        const result = list.payload;
        if (result && result.length > 0) {
            for (const m of result) {
                if (m.isActive) {
                    const itemIds = m.items.map((item) => item.id);
                    m.disabled = m.items.length > 0 && !itemIds.includes(props.id) ? true : false;
                    data.push(m);
                }
            }
        }
        setMachines(data);
    };
    const prepareNewItem = async () => {
        setLoading(true);
        setTagList([]);
        await Promise.all([loadMachines(), getTagData(), getAssign()]);
        reSet();
        setLoading(false);
        const user = initialState!.currentUser!;
        setAssignOriginSelected([
            { title: user.email, value: user.id.toString(), canAssign: true },
        ]);
    };

    const getAssign = async () => {
        const res = await getUserAndGroup();
        if (!res.fail) {
            const treeData: AssignItem[] = [];
            const groups = res.payload?.groupUsers;
            groups?.forEach((item) => {
                const tmp: AssignItem = {
                    value: item.groupName,
                    title: item.groupName,
                    children: [],
                };
                item.domainUsers.forEach((user) => {
                    tmp.children?.push({
                        value: user.id.toString(),
                        title: user.email,
                    });
                });
                treeData.push(tmp);
            });
            const users = res.payload?.domainUsers;
            users?.forEach((item) => {
                treeData.push({
                    value: item.id.toString(),
                    title: item.email,
                });
            });
            setAssignData(treeData);
        }
    };

    const prepareExistedItem = async () => {
        const oldTimestamp = Timestamp;
        setLoading(true);
        const resArray = await Promise.all([
            loadMachines(),
            getLoginDetail(props.id),
            getTagData(),
            getAssign(),
        ]);
        if (oldTimestamp != Timestamp) return;
        const res = resArray[1];
        if (res.fail) {
            message.errorIntl(res.errorId);
        } else {
            const cbResult: AppDetail = res.payload;
            const detail: AppDetail = {
                ...cbResult,
                id: cbResult.id,
                description: cbResult.description,
                loginUri: cbResult.loginUri,
                loginUser: cbResult.loginUser,
                loginPassword: cbResult.loginPassword,
            };

            var cryptoService = new TCryptoService();
            detail.loginPassword = await cryptoService.decryptText(detail.loginPassword, false);

            reSet(detail);
            setAssignOriginSelected(
                cbResult.accesses.map((item) => ({
                    value: item.userId.toString(),
                    title: item.email!,
                    canAssign: item.canAssign,
                })),
            );
            const tagList = cbResult.tags.map((item) => ({ id: item.id, value: item.name }));
            setTagList(tagList);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (props.visible) {
            Timestamp = new Date().getTime();
            setStatus(props.status);
            if (props.status == 'new') {
                prepareNewItem();
            } else {
                prepareExistedItem();
            }
        }
    }, [props.visible, props.id, props.status]);

    const handleChangeTag = (tagList: TagOption[]) => {
        setTagList(tagList);
    };
    const machineRadioChange = (e) => {
        setIsAnyMachine(e.target.value);
    };

    function handleSelectChange(values: number) {
        setSelectedValue(values);
    }

    function onSelectChange(value: AssignListItem[]) {
        setAssignSelected(value);
    }

    const machineDisabledTitle = (item: MachineItem['items']) => {
        if (item.length > 0) {
            const name = item[0].name;
            return Intl.formatMessage({ id: 'client.machine.bound' }) + ': ' + name;
        } else {
            return '';
        }
    };

    return (
        <RightForm
            visible={visible}
            loading={loading}
            title={<FormattedMessage id="vault.login.title" />}
            onSave={submitClick}
            onCancel={cancleClick}
            onEdit={handleEdit}
            createTime={createTime}
            updateTime={updateTime}
            status={status}
        >
            <>
                <div className={styles.main}>
                    <Form
                        onFinish={handleFinish}
                        ref={formRef}
                        layout="vertical"
                        name="basic"
                        form={form}
                        initialValues={{ remember: true }}
                        autoComplete="off"
                        requiredMark="optional"
                    >
                        <Form.Item
                            className={styles.formItem}
                            label={
                                <span>
                                    <FormattedMessage id="vault.description" />*
                                </span>
                            }
                            name="description"
                            style={{ marginBottom: '6px' }}
                            rules={[
                                {
                                    required: true,
                                    message: <FormattedMessage id="vault.description.error" />,
                                },
                                {
                                    pattern: pattern.nonBlankChars,
                                    message: <FormattedMessage id="common.emptyCharacters" />,
                                },
                                {
                                    max: 255,
                                    message: <FormattedMessage id="limit.max.255" />,
                                },
                            ]}
                        >
                            <Input
                                style={{ height: '27px', borderRadius: '3px' }}
                                disabled={status == 'view'}
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span>
                                    <FormattedMessage id="vault.loginUri" />*
                                </span>
                            }
                            name="loginUri"
                            style={{ marginBottom: '6px' }}
                            rules={[
                                {
                                    required: true,
                                    message: <FormattedMessage id="vault.loginUri.error" />,
                                },
                                {
                                    message: <FormattedMessage id="vault.loginUri.formatError" />,
                                },
                                {
                                    max: 2048,
                                    message: <FormattedMessage id="limit.max.2048" />,
                                },
                            ]}
                        >
                            <Input
                                style={{ height: '27px', borderRadius: '3px' }}
                                placeholder="https://example.com"
                                disabled={status == 'view'}
                            />
                        </Form.Item>
                        <Form.Item
                            style={{
                                margin: 0,
                            }}
                            required
                        >
                            <Row>
                                <Col span={11}>
                                    <Form.Item
                                        style={{ marginBottom: '6px' }}
                                        label={
                                            <span>
                                                <FormattedMessage id="vault.userName" />*
                                            </span>
                                        }
                                        name="loginUser"
                                        rules={[
                                            {
                                                required: true,
                                                message: (
                                                    <FormattedMessage id="vault.loginUserName.error" />
                                                ),
                                            },
                                            {
                                                pattern: pattern.nonBlankChars,
                                                message: (
                                                    <FormattedMessage id="common.emptyCharacters" />
                                                ),
                                            },
                                            {
                                                max: 255,
                                                message: <FormattedMessage id="limit.max.255" />,
                                            },
                                        ]}
                                    >
                                        <Input
                                            prefix={
                                                <UserOutlined className="site-form-item-icon" />
                                            }
                                            style={{ height: '27px', borderRadius: '3px' }}
                                            disabled={status == 'view'}
                                        ></Input>
                                    </Form.Item>
                                </Col>
                                <Col span={2} />
                                <Col span={11}>
                                    <Form.Item
                                        style={{ marginBottom: '6px' }}
                                        name="loginPassword"
                                        label={
                                            <span>
                                                <FormattedMessage id="vault.password" />*
                                            </span>
                                        }
                                        rules={[
                                            {
                                                required: true,
                                                message: (
                                                    <FormattedMessage id="vault.loginPassword.error" />
                                                ),
                                            },
                                            {
                                                max: 255,
                                                message: <FormattedMessage id="limit.max.255" />,
                                            },
                                        ]}
                                    >
                                        <Input.Password
                                            style={{ height: '27px', borderRadius: '3px' }}
                                            prefix={
                                                <LockOutlined className="site-form-item-icon" />
                                            }
                                            iconRender={(visible) =>
                                                status == 'view' ? (
                                                    <></>
                                                ) : visible ? (
                                                    <EyeOutlined />
                                                ) : (
                                                    <EyeInvisibleOutlined />
                                                )
                                            }
                                            type="password"
                                            disabled={status == 'view'}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </div>

                <div style={{ backgroundColor: 'white' }}>
                    <Tabs
                        defaultActiveKey="1"
                        type="card"
                        size="small"
                        tabBarGutter={-1}
                        className={styles.tabs}
                    >
                        <TabPane
                            tab={<FormattedMessage id="vault.assign" />}
                            key="1"
                            style={{ paddingLeft: 10, paddingRight: 10 }}
                        >
                            <div style={{ marginBottom: 10 }}>
                                <AssignSelect
                                    data={assignData}
                                    selected={assignOriginSelected}
                                    disabled={status == 'view'}
                                    onChange={onSelectChange}
                                    ableToAssign={true}
                                    dropdownClassName="rightFormDropDown"
                                />
                            </div>
                        </TabPane>
                        <TabPane tab={<FormattedMessage id="vault.bind.machine" />} key="2">
                            <div style={{ margin: '0 10px 10px 10px' }}>
                                <Radio.Group
                                    onChange={machineRadioChange}
                                    value={isAnyMachine}
                                    disabled={status == 'view'}
                                    style={{ margin: '0 0 10px 0' }}
                                >
                                    <Space direction="vertical">
                                        <Radio value={true}>
                                            <FormattedMessage id="vault.anyMachine" />
                                        </Radio>
                                        <Radio value={false}>
                                            <FormattedMessage id="vault.clientMachineName" />
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                                <Select
                                    style={{ width: '100%' }}
                                    maxTagCount={0}
                                    listHeight={128}
                                    value={selectedValue}
                                    disabled={isAnyMachine || status == 'view'}
                                    onChange={handleSelectChange}
                                    optionLabelProp="label"
                                    optionFilterProp="label"
                                    showSearch
                                    dropdownRender={(menu) => (
                                        <div>
                                            <Row>
                                                <Col span={17} style={{ padding: '0 0 0 10px' }}>
                                                    <Text strong={true}>
                                                        <FormattedMessage id="vault.machineDescription" />
                                                    </Text>
                                                </Col>
                                                <Col span={7}>
                                                    <Text strong={true}>
                                                        <FormattedMessage id="client.ip" />
                                                    </Text>
                                                </Col>
                                            </Row>
                                            {menu}
                                        </div>
                                    )}
                                    dropdownClassName="rightFormDropDown"
                                >
                                    {machines?.map((machine) => (
                                        <Option
                                            label={`${machine.machineName} (${machine.proxyAddress})`}
                                            key={machine.id}
                                            value={machine.id}
                                            disabled={machine.disabled}
                                        >
                                            {machine.disabled ? (
                                                <Tooltip
                                                    trigger="hover"
                                                    title={machineDisabledTitle(machine.items)}
                                                >
                                                    <Row
                                                        style={{
                                                            opacity: machine.disabled ? '0.6' : '1',
                                                        }}
                                                    >
                                                        <Col span={17}>
                                                            <Text
                                                                ellipsis={{
                                                                    tooltip: machine.disabled
                                                                        ? false
                                                                        : `${machine.machineName}`,
                                                                }}
                                                            >
                                                                {machine.machineName}
                                                            </Text>
                                                        </Col>
                                                        <Col span={7}>
                                                            <Text
                                                                ellipsis={{
                                                                    tooltip: machine.disabled
                                                                        ? false
                                                                        : `${machine.proxyAddress}`,
                                                                }}
                                                            >
                                                                {machine.proxyAddress}
                                                            </Text>
                                                        </Col>
                                                    </Row>
                                                </Tooltip>
                                            ) : (
                                                <Row
                                                    style={{
                                                        opacity: machine.disabled ? '0.6' : '1',
                                                    }}
                                                >
                                                    <Col span={17}>
                                                        <Text
                                                            ellipsis={{
                                                                tooltip: machine.disabled
                                                                    ? false
                                                                    : `${machine.machineName}`,
                                                            }}
                                                        >
                                                            {machine.machineName}
                                                        </Text>
                                                    </Col>
                                                    <Col span={7}>
                                                        <Text
                                                            ellipsis={{
                                                                tooltip: machine.disabled
                                                                    ? false
                                                                    : `${machine.proxyAddress}`,
                                                            }}
                                                        >
                                                            {machine.proxyAddress}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>

                <div className={styles.tagContainer}>
                    <Tag
                        optionsRes={options}
                        callback={handleChangeTag}
                        buttonVisable={status != 'view'}
                        tagListRes={tagList}
                    ></Tag>
                </div>
            </>
        </RightForm>
    );
};
