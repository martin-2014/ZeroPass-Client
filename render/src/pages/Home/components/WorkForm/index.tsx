import AssignSelect, { PropsType } from '@/components/AssignSelect';
import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag from '@/pages/Home/components/Tag';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { Access, getUserAndGroup, getWorkLoginDetail, WorkDetail } from '@/services/api/logins';
import { onceExecutor } from '@/services/api/requester';
import { getFaviconUrl } from '@/utils/tools';
import { Form, FormInstance } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';
import { useList } from '../../Context/hooks';
import { TagOption } from '../../datatypes';
import FormContent from './Form';
import styles from './index.less';
import { getPersonalLoginDetail, VaultItemType } from '@/services/api/vaultItems';
import Image from '@/components/Image';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type EditProps = {
    editing: boolean;
    changeEditing: (value: boolean) => void;
};

const executor = onceExecutor();

export const EditForm = (props: EditProps) => {
    const { editing, changeEditing } = props;
    const originalFormData = useRef<Partial<WorkDetail> | null>(null);
    const originalTagList = useRef<TagOption[]>();
    const assignSelectInitRef = useRef<PropsType['selected']>([]);
    const [assignSelectInit, setAssignSelectInit] = useState<PropsType['selected']>([]);
    const [assignData, setAssignData] = useState<PropsType['data']>([]);
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [img, setImg] = useState('');
    const [accesses, setAccesses] = useState<Access[]>([]);
    const [domainTagList, setDomainTagList] = useState<TagOption[]>([]);
    const [mainLoading, setMainloading] = useState(false);
    const [anyClientMachine, setAnyClientMachine] = useState(true);
    const [formHeader, setFormHeader] = useState<FormHeader>();
    const submitClick = () => {
        formRef.current?.submit();
    };
    const { selectedId, selectedItem, setSelectedId } = useList();
    const isDomainItem = selectedItem?.isDomainItem;
    const canAssign = selectedItem?.assignable;
    const hasSelected = selectedId && selectedId !== -1 ? true : false;
    const handleCancel = () => {
        setSelectedId(-1);
    };

    const getAssign = async () => {
        const res = await getUserAndGroup();
        if (!res.fail) {
            const treeData: PropsType['data'] = [];
            const groups = res.payload?.groupUsers;
            groups?.forEach((item) => {
                const tmp: PropsType['data'][0] = {
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

    const getDetail = async () => {
        setMainloading(true);
        if (canAssign) {
            getAssign();
        }
        const req = isDomainItem ? getWorkLoginDetail : getPersonalLoginDetail;
        const res = await executor(() => req(selectedId));
        if (res.skip) return;
        if (res.fail) {
            setMainloading(false);
            errHandlers.default(res);
            return;
        }

        const payload = res.payload as WorkDetail;

        const cryptoService = new TCryptoService();
        payload.loginPassword = isDomainItem
            ? //await cryptoService.decryptText(payload?.loginPassword!, restAPI.decryptTextForEnterprise):
              /*由于保密，Home Page查看公司的账户信息，密码是假的*/
              '**********'
            : await cryptoService.decryptText(payload?.loginPassword!, true);

        payload.oneTimePassword =
            isDomainItem || !payload?.oneTimePassword
                ? ''
                : await cryptoService.decryptText(payload?.oneTimePassword!, true);

        originalFormData.current = {
            ...originalFormData.current,
            ...payload!,
        };

        if (isDomainItem) {
            form.setFieldsValue({ alias: selectedItem.alias || payload?.description });
            form.setFieldsValue({ clientMachineName: payload?.clientMachineName });
        } else {
            form.setFieldsValue({ name: payload?.name });
        }
        if (payload?.clientMachineName) {
            setAnyClientMachine(false);
        } else {
            setAnyClientMachine(true);
        }
        form.setFieldsValue({ loginUri: payload?.loginUri });
        form.setFieldsValue({ loginUser: payload?.loginUser });
        form.setFieldsValue({ clientMachineName: payload?.clientMachineName });
        form.setFieldsValue({ oneTimePassword: payload?.oneTimePassword });
        form.setFieldsValue({ note: payload?.note });
        form.setFieldsValue({ passwordUpdateTime: payload?.passwordUpdateTime });
        const imgUri = getFaviconUrl(payload?.loginUri);
        setFormHeader({
            title: isDomainItem ? selectedItem?.alias || payload?.description! : payload?.name!,
            Icon: (
                <Image
                    src={imgUri}
                    defaulticon={IconMap(VaultItemType.Login, FORM_ICON_SIZE)}
                ></Image>
            ),
        });
        setImg(imgUri);
        if (canAssign) {
            const data =
                (payload?.accesses?.map((item) => ({
                    value: item.userId?.toString(),
                    title: item.email,
                    canAssign: item.canAssign,
                })) as PropsType['selected']) || [];
            setAssignSelectInit(data);
        }

        form.setFieldsValue({ loginPassword: payload?.loginPassword });
        setPasswordVisible(true);
        form.setFieldsValue({ id: payload?.id });
        const taglist = payload?.tags.map((item) => ({
            id: item.id!,
            value: item.name,
        }));
        if (isDomainItem) {
            setDomainTagList(taglist!);
        } else {
            setTagList(taglist!);
        }

        originalTagList.current = [...taglist!];
        setTimeout(() => setMainloading(false), 100);
    };

    useEffect(() => {
        if (hasSelected) {
            getDetail();
            setIsShowPassword(false);
        }
    }, [selectedId]);

    const handleAssignChange = (selectData: PropsType['selected']) => {
        assignSelectInitRef.current = selectData;
        const data = selectData.map((item) => ({
            userId: +item.value,
            canAssign: item.canAssign,
        }));
        setAccesses(data);
    };

    const onCloseEdit = (alias: string) => {
        changeEditing(false);
        if (isDomainItem) {
            setAssignSelectInit([...assignSelectInitRef.current]);
            const imgUri = getFaviconUrl(originalFormData.current?.loginUri || '');
            setFormHeader({
                title: alias || originalFormData.current?.name || '',
                Icon: (
                    <Image
                        src={imgUri}
                        defaulticon={IconMap(VaultItemType.Login, FORM_ICON_SIZE)}
                    ></Image>
                ),
            });
        } else {
            originalFormData.current = { ...form.getFieldsValue() };
            originalTagList.current = [...tagList];
            const imgUri = getFaviconUrl(originalFormData.current?.loginUri || '');
            setFormHeader({
                title: alias || originalFormData.current?.name || '',
                Icon: (
                    <Image
                        src={imgUri}
                        defaulticon={IconMap(VaultItemType.Login, FORM_ICON_SIZE)}
                    ></Image>
                ),
            });
            setImg(getFaviconUrl(imgUri));
            setIsShowPassword(false);
        }
    };

    const handleChangeTagList = (data: TagOption[]) => {
        setTagList(data);
    };

    return (
        <div className={styles.wrapper}>
            <AppForm
                visible={hasSelected}
                onSave={submitClick}
                onCancel={handleCancel}
                onEdit={changeEditing}
                isEdit={editing}
                loadingVisible={mainLoading}
                formHeader={formHeader}
            >
                <div style={{ padding: '0 10px 0 5px', width: '100%' }}>
                    <FormContent
                        anyClientMachine={anyClientMachine}
                        onClose={onCloseEdit}
                        isNewItem={false}
                        accesses={accesses}
                        img={img}
                        ref={formRef}
                        form={form}
                        isEdit={editing}
                        tags={tagList.map((tag) => tag.value)}
                        isShowPassWord={isShowPassword}
                        onShowPassword={(show) => {
                            setIsShowPassword(show);
                        }}
                        changeLoadingState={(edit) => setLoading(edit)}
                        passwordVisible={passwordVisible}
                    />
                    <div
                        style={{
                            marginTop: '30px',
                            display: props.editing && canAssign ? '' : 'none',
                        }}
                    >
                        <AssignSelect
                            onChange={handleAssignChange}
                            data={assignData}
                            selected={assignSelectInit}
                            ableToAssign={false}
                        />
                    </div>
                    <div style={{ marginTop: '30px' }}>
                        <Tag
                            selectedTags={isDomainItem ? domainTagList : tagList}
                            onSelectedChanged={handleChangeTagList}
                            buttonVisable={editing && !isDomainItem}
                        ></Tag>
                    </div>
                </div>
            </AppForm>
        </div>
    );
};

type NewProps = {
    changeNew: (value: boolean) => void;
};

export const NewForm = (props: NewProps) => {
    const { changeNew } = props;
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);

    const onSelectedTagsChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const clearForm = (form: FormInstance) => {
        form.setFieldsValue({
            description: '',
            loginUri: '',
            loginUser: '',
            loginPassword: '',
        });
    };

    const onCloseNew = () => {
        clearForm(form);
        setTagList([]);
        changeNew(false);
    };
    return (
        <SimpleModal
            width={600}
            close={onCloseNew}
            loading={loading}
            onOk={() => {
                formRef.current?.submit();
            }}
            title={<FormattedMessage id="vault.login.title" />}
        >
            <ScrollContainter style={{ height: 460 }}>
                <div style={{ padding: '20px 20px 0 20px' }}>
                    <FormContent
                        isNewItem={true}
                        isEdit={true}
                        ref={formRef}
                        form={form}
                        onClose={onCloseNew}
                        changeLoadingState={(edit) => setLoading(edit)}
                        tags={tagList.map((tag) => tag.value)}
                    />
                    <div style={{ width: '100%', height: 20 }}></div>
                    <Tag
                        selectedTags={tagList}
                        onSelectedChanged={onSelectedTagsChange}
                        buttonVisable={true}
                    ></Tag>
                </div>
            </ScrollContainter>
        </SimpleModal>
    );
};
