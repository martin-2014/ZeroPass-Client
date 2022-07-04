import styles from './index.less';
import { Form, Input } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { getGroupDetail, addGroup, updateGroup, member, GroupDetail } from '@/services/api/groups';
import { FormattedMessage, useIntl } from 'umi';
import { listDomainUsers } from '@/services/api/domainusers';
import Multiselect, { ProsType } from '@/components/Multiselect';
import { errHandlers } from '@/services/api/errHandlers';
import RightForm, { RightFormStatus } from '@/components/RightForm';
import message from '@/utils/message';

type props = {
    visible: boolean;
    cancel: () => void;
    id: number;
    status: RightFormStatus;
    reload: () => void;
};

type MemberItem = {
    label: string;
    value: number;
    enable: boolean;
};

export default (props: props) => {
    const Intl = useIntl();
    const [status, setStatus] = useState<RightFormStatus>(props.status);
    const formRef = useRef(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const handleCancle = props.cancel;
    const visible = props.visible;
    const reload = props.reload;
    const [createTime, setCreateTime] = useState('');
    const [updateTime, setUpdatedTime] = useState('');
    const [multiselectData, setMultiselectData] = useState<number[]>([]);
    const [multiData, setMultiData] = useState<ProsType['data']>([]);
    const selectedRef = useRef<ProsType['data']>([]);

    const handleEdit = () => {
        setStatus('edit');
    };
    const submitClick = () => {
        formRef.current?.submit();
    };

    const reSet = () => {
        form.setFieldsValue({ name: '', description: '', createTime: '', updateTime: '' });
        setCreateTime('');
        setUpdatedTime('');
    };

    const cancleClick = () => {
        handleCancle();
        if (status == 'new') {
            reSet();
        }
    };

    const handleFinish = async (e: API.UserItem) => {
        setLoading(true);
        let member: member[] = [];
        if (selectedRef.current.length) {
            member = selectedRef.current.map((item) => {
                return {
                    userId: item.value as number,
                    email: item.label,
                };
            });
        }
        if (status == 'new') {
            const res = await addGroup({
                ...e,
                members: member,
            });
            if (res.fail) {
                setLoading(false);
                message.errorIntl(res.errorId);
                errHandlers.default(res);
                return;
            }
        } else {
            const res = await updateGroup({
                ...e,
                id: props.id,
                members: member,
            });
            if (res.fail) {
                setLoading(false);
                message.errorIntl(res.errorId);
                errHandlers.default(res);
                return;
            }
        }
        setLoading(false);
        message.success(Intl.formatMessage({ id: 'common.save.success' }));
        handleCancle();
        reload();
    };

    const handleChange = (data: ProsType['data']) => {
        selectedRef.current = data;
    };

    const getGroup = async () => {
        const groupDetailRes = await getGroupDetail(props.id);
        if (groupDetailRes.fail) {
            errHandlers.default(groupDetailRes);
            return null;
        }
        return groupDetailRes.payload!;
    };

    const getUsers = async () => {
        const res = await listDomainUsers();
        const data: MemberItem[] = [];
        if (res.fail) {
            errHandlers.default(res);
            return data;
        }
        const userData = res.payload!;
        for (let item of userData) {
            const items = {
                label: item.email,
                value: item.id,
                enable: item.isActive,
            };
            data.push(items);
        }

        return data;
    };

    const setGroupDetail = (groupData: GroupDetail) => {
        setCreateTime(groupData.createTime);
        setUpdatedTime(groupData.updateTime);
        form.setFieldsValue({ name: groupData.name });
        form.setFieldsValue({ description: groupData.description });
    };

    const setSelectedMembers = (groupData: GroupDetail | null, users: MemberItem[]) => {
        const selectData = [];
        if (groupData && groupData.members.length) {
            for (let item of users) {
                for (let s of groupData.members) {
                    if (s.userId === item.value) {
                        selectData.push(s.userId);
                    }
                }
            }
        }
        setMultiselectData(selectData);
    };

    const loadData = async (type: RightFormStatus) => {
        setLoading(true);
        const userRequest = getUsers();
        let users: MemberItem[] = [];
        let group = null;
        if (type == 'new') {
            users = await userRequest;
            reSet();
        } else {
            group = await getGroup();
            if (group) {
                setGroupDetail(group);
            }
            users = await userRequest;
        }
        setSelectedMembers(group, users);
        setMultiData(users);
        setLoading(false);
    };

    useEffect(() => {
        if (props.visible) {
            setStatus(props.status);
            loadData(props.status);
        }
    }, [props.visible, props.status, props.id]);

    const Title = () => {
        if (status == 'new') {
            return <FormattedMessage id="groups.group" />;
        }
        return status == 'edit' ? (
            <FormattedMessage id="groups.editGroup" />
        ) : (
            <FormattedMessage id="groups.group" />
        );
    };

    return (
        <RightForm
            visible={visible}
            loading={loading}
            title={<Title />}
            onSave={submitClick}
            onEdit={handleEdit}
            onCancel={cancleClick}
            createTime={createTime}
            updateTime={updateTime}
            status={status}
        >
            <>
                <div className={styles.userForm}>
                    <Form
                        onFinish={handleFinish}
                        ref={formRef}
                        layout="vertical"
                        name="basic"
                        form={form}
                        initialValues={{ remember: true }}
                        autoComplete="off"
                        requiredMark={false}
                    >
                        <Form.Item
                            className={styles.formItem}
                            label={
                                <span>
                                    <FormattedMessage id="groups.groupName" />*
                                </span>
                            }
                            name="name"
                            style={{ marginBottom: '6px' }}
                            rules={[
                                {
                                    required: true,
                                    message: <FormattedMessage id="groups.requireName" />,
                                },
                                {
                                    pattern: /(^\S.{0,255}\S$)|(^\S$)/,
                                    message: <FormattedMessage id="common.emptyCharacters" />,
                                },
                            ]}
                        >
                            <Input
                                style={{ height: '27px', borderRadius: '3px' }}
                                disabled={status == 'view'}
                                maxLength={255}
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span>
                                    <FormattedMessage id="common.description" />
                                </span>
                            }
                            name="description"
                            style={{ marginBottom: '6px' }}
                            rules={[
                                {
                                    pattern: /^.{0,255}$/,
                                    message: <FormattedMessage id="limit.max.255" />,
                                },
                            ]}
                        >
                            <Input
                                style={{ height: '27px', borderRadius: '3px' }}
                                disabled={status == 'view'}
                            />
                        </Form.Item>
                    </Form>
                </div>
                <div className={styles.userInfoTitle}>
                    <div className={styles.infoWrapper} style={{ width: '130px' }}>
                        <span>
                            <FormattedMessage id="groups.groupMembers" />
                        </span>
                    </div>
                    <div className={styles.infoLine} />
                </div>
                <Multiselect
                    data={multiData}
                    selected={multiselectData}
                    onChange={handleChange}
                    title={<FormattedMessage id="common.users" />}
                    edit={status !== 'view'}
                    hiddenOwner={true}
                    dropdownClassName="rightFormDropDown"
                />
            </>
        </RightForm>
    );
};
