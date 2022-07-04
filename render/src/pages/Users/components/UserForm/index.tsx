import { Divider, Space } from 'antd';
import styles from './index.less';
import { Form, Input, Row, Col } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { getUserById, updateUser, UserGroup, DetailItem } from '@/services/api/userManager';
import { listGroups } from '@/services/api/groups';
import { useIntl, FormattedMessage, useModel } from 'umi';
import Multiselect, { ProsType } from '@/components/Multiselect';
import RightForm, { RightFormStatus } from '@/components/RightForm';
import message from '@/utils/message';
import { UserStatusType, UserRoleType, UserStatusOptions, UserRoleOptions } from '../..';
import HubOption from '@/components/HubOption';

type props = {
    visible: boolean;
    cancel: () => void;
    id: number;
    reload: () => void;
    status: RightFormStatus;
};

export default (props: props) => {
    const Intl = useIntl();
    const [createTime, setCreateTime] = useState('');
    const [updateTime, setUpdatedTime] = useState('');
    const [status, setStatus] = useState<RightFormStatus>(props.status);
    const formRef = useRef(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [multiselectData, setMultiselectData] = useState<number[]>([]);
    const [multiData, setMultiData] = useState<ProsType['data']>([]);
    const selectedRef = useRef<ProsType['data']>([]);
    const [userInfo, setUserInfo] = useState<DetailItem & { role: number }>();

    const { initialState } = useModel('@@initialState');

    const handleCancle = props.cancel;
    const visible = props.visible;
    const reload = props.reload;
    const handleEdit = () => {
        setStatus('edit');
    };
    const submitClick = () => {
        formRef.current?.submit();
    };

    const cancleClick = () => {
        handleCancle();
    };

    const handleChange = (data: ProsType['data']) => {
        selectedRef.current = data;
    };
    const getUser = async () => {
        const user = await getUserById(props.id);
        const groups = await listGroups();
        if (groups.fail || user.fail) {
            setLoading(false);
            return;
        }
        const groupData = groups.payload;
        const detail = user.payload;

        let role = UserRoleType.User;
        if (detail?.isDomainOwner) {
            role = UserRoleType.Owner;
        } else if (detail?.isDomainAdmin) {
            role = UserRoleType.Admin;
        }
        setUserInfo({ ...detail!, role: role });
        if (groupData?.length) {
            const data = [];
            for (let item of groupData) {
                const items = {
                    label: item.name,
                    value: item.id,
                };
                data.push(items);
            }
            if (detail && detail.groups.length) {
                const selectData = [];
                for (let item of data) {
                    for (let s of detail.groups) {
                        if (item.value === s.groupId) {
                            selectData.push(s.groupId);
                        }
                    }
                }
                setMultiselectData(selectData);
            } else {
                setMultiselectData([]);
            }
            setMultiData(data);
        } else {
            setMultiData([]);
        }
        setCreateTime(detail!.createTime);
        setUpdatedTime(detail!.updateTime);
        setLoading(false);
    };

    useEffect(() => {
        if (props.visible) {
            setStatus(props.status);
            setLoading(true);
            getUser();
        }
    }, [props.visible, props.id, props.status]);

    const changeStatus = (id: number, status: number) => {
        setUserInfo({ ...userInfo!, status: status });
    };

    const changeRole = (id: number, isAdmin: boolean) => {
        let role = UserRoleType.User;
        if (isAdmin) {
            role = UserRoleType.Admin;
        }
        setUserInfo({ ...userInfo!, isDomainAdmin: isAdmin, role: role });
    };

    const handleFinish = async (e: API.UserItem) => {
        setLoading(true);
        let group: UserGroup[] = [];
        if (selectedRef.current.length) {
            group = selectedRef.current.map((item) => {
                return {
                    groupId: item.value as number,
                    name: item.label,
                };
            });
        }
        const res = await updateUser({
            isActive: userInfo?.status == 1,
            isAdmin: userInfo!.isDomainAdmin,
            userId: props.id,
            groups: group,
        });
        setLoading(false);
        if (res.fail) {
            message.errorIntl(res.errorId);
            return;
        }
        handleCancle();
        reload();
    };

    const roleDisabled = () => {
        return status == 'view' || userInfo!.isDomainOwner || !initialState?.currentUser?.isOwner;
    };

    const statusDisabled = () => {
        return (
            (!initialState?.currentUser?.isOwner && userInfo?.isDomainAdmin) ||
            status == 'view' ||
            userInfo!.isDomainOwner
        );
    };

    const getStatusOptions = (status: UserStatusType) => {
        let filters = [UserStatusType.Pendding, UserStatusType.Approve, UserStatusType.Reject];
        if (status == UserStatusType.Pendding) {
            filters = [UserStatusType.Active, UserStatusType.Inactive];
        }
        return UserStatusOptions.filter((item) => !filters.includes(+item.value));
    };

    const getRoleOptions = (isOwner: boolean) => {
        let filters: UserRoleType[] = [];
        if (!isOwner) filters.push(UserRoleType.Owner);
        return UserRoleOptions.filter((item) => !filters.includes(+item.value));
    };

    return (
        <RightForm
            visible={visible}
            loading={loading}
            title={<FormattedMessage id="common.user" />}
            onSave={submitClick}
            onCancel={cancleClick}
            onEdit={handleEdit}
            createTime={createTime}
            updateTime={updateTime}
            status={status}
            createTitle={<FormattedMessage id="user.joined.time" />}
        >
            <>
                <div className={styles.userForm}>
                    <Form
                        onFinish={handleFinish}
                        ref={formRef}
                        name="basic"
                        form={form}
                        autoComplete="off"
                    >
                        <Form.Item label={<FormattedMessage id="userProfile.email" />}>
                            <Input disabled value={userInfo?.email}></Input>
                        </Form.Item>
                        <Row>
                            <Col span={8}>
                                <Space>
                                    <span style={{ color: '#303030' }}>
                                        <FormattedMessage id="common.status" />
                                    </span>
                                    {userInfo ? (
                                        <HubOption
                                            disable={statusDisabled()}
                                            value={userInfo.status ?? 2}
                                            options={getStatusOptions(userInfo.status ?? 2)}
                                            onChange={(item) => {
                                                changeStatus(userInfo.id, +item.value);
                                            }}
                                            theme="outline"
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </Space>
                            </Col>
                            <Col span={16}>
                                <Space>
                                    <span style={{ color: '#303030' }}>
                                        <FormattedMessage id="common.type" />
                                    </span>
                                    {userInfo ? (
                                        <HubOption
                                            value={+userInfo.role}
                                            options={getRoleOptions(userInfo.isDomainOwner)}
                                            onChange={(item) => {
                                                changeRole(
                                                    userInfo.id,
                                                    item.value == UserRoleType.Admin,
                                                );
                                            }}
                                            disable={roleDisabled()}
                                            theme="fill"
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <Divider />
                <div className={styles.userInfoTitle}>
                    <div className={styles.infoWrapper}>
                        <span>
                            <FormattedMessage id="users.form.teamInfo" />
                        </span>
                    </div>
                    <div className={styles.infoLine} />
                </div>
                <Multiselect
                    data={multiData}
                    selected={multiselectData}
                    onChange={handleChange}
                    title={<FormattedMessage id="users.form.teamName" />}
                    edit={status != 'view'}
                    hiddenOwner={true}
                    placeholder={Intl.formatMessage({ id: 'users.form.searchTeam' })}
                    dropdownClassName="rightFormDropDown"
                />
            </>
        </RightForm>
    );
};
