import Image from '@/components/Image';
import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag from '@/pages/Home/components/Tag';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { WorkDetail } from '@/services/api/logins';
import { onceExecutor } from '@/services/api/requester';
import { getPersonalLoginDetail, VaultItemType } from '@/services/api/vaultItems';
import { getFaviconUrl } from '@/utils/tools';
import { Form, FormInstance } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';
import { useList } from '@/pages/Home/Context/hooks';
import { TagOption } from '@/pages/Home/datatypes';
import { FORM_ICON_SIZE } from '../../tools';
import IconMap from '../IconMap';
import FormContent from './Form';
import styles from './index.less';

export type EditProps = {
    editing: boolean;
    changeEditing: (value: boolean) => void;
};

const executor = onceExecutor();

export const EditForm = (props: EditProps) => {
    const { editing, changeEditing } = props;
    const [loading, setLoading] = useState(false);
    const originalFormData = useRef<Partial<WorkDetail> | null>(null);
    const originalTagList = useRef<TagOption[]>();
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [img, setImg] = useState('');
    const [mainLoading, setMainloading] = useState(false);
    const [anyClientMachine, setAnyClientMachine] = useState(true);
    const [formHeader, setFormHeader] = useState<FormHeader>();
    const submitClick = () => {
        formRef.current?.submit();
    };
    const { selectedId, setSelectedId } = useList();
    const hasSelected = selectedId && selectedId !== -1 ? true : false;
    const handleCancel = () => {
        setSelectedId(-1);
    };

    const getDetail = async () => {
        setMainloading(true);
        const req = getPersonalLoginDetail;
        const res = await executor(() => req(selectedId));
        if (res.skip) return;
        if (res.fail) {
            setMainloading(false);
            errHandlers.default(res);
            return;
        }

        const payload = res.payload as WorkDetail;

        const cryptoService = new TCryptoService();
        payload.loginPassword = await cryptoService.decryptText(payload?.loginPassword!, true);

        payload.oneTimePassword = !payload?.oneTimePassword
            ? ''
            : await cryptoService.decryptText(payload?.oneTimePassword!, true);

        originalFormData.current = {
            ...originalFormData.current,
            ...payload!,
        };
        form.setFieldsValue({ name: payload?.name });
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
            title: payload?.name!,
            Icon: (
                <Image
                    src={imgUri}
                    defaulticon={IconMap(VaultItemType.Login, FORM_ICON_SIZE)}
                ></Image>
            ),
        });
        setImg(imgUri);

        form.setFieldsValue({ loginPassword: payload?.loginPassword });
        setPasswordVisible(true);
        form.setFieldsValue({ id: payload?.id });
        const taglist = payload?.tags.map((item) => ({
            id: item.id!,
            value: item.name,
        }));

        setTagList(taglist!);

        originalTagList.current = [...taglist!];
        setTimeout(() => setMainloading(false), 100);
    };

    useEffect(() => {
        if (hasSelected) {
            getDetail();
            setIsShowPassword(false);
        }
    }, [selectedId]);

    const onCloseEdit = (alias: string) => {
        changeEditing(false);

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
                editLoading={loading}
            >
                <div style={{ padding: '0 10px 0 5px', width: '100%' }}>
                    <FormContent
                        anyClientMachine={anyClientMachine}
                        onClose={onCloseEdit}
                        isNewItem={false}
                        img={img}
                        ref={formRef}
                        form={form}
                        isEdit={editing}
                        tags={tagList.map((tag) => tag.value)}
                        isShowPassWord={isShowPassword}
                        onShowPassword={(show) => {
                            setIsShowPassword(show);
                        }}
                        passwordVisible={passwordVisible}
                        changeLoadingState={(edit) => setLoading(edit)}
                    />
                    <div style={{ marginTop: '30px' }}>
                        <Tag
                            selectedTags={tagList}
                            onSelectedChanged={handleChangeTagList}
                            buttonVisable={editing}
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
