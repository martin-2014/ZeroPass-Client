import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag from '@/pages/Home/components/Tag';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { PersonalInfoDetail, VaultItemType, VaultItemView } from '@/services/api/vaultItems';
import { Form, FormInstance } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';
import { useList, useTag } from '@/pages/Home/Context/hooks';
import { TagOption } from '@/pages/Home/datatypes';
import { FORM_ICON_SIZE } from '../../tools';
import IconMap from '../IconMap';
import FormContent from './Form';
import styles from './index.less';

type EditProps = {
    editing: boolean;
    changeEditing: (value: boolean) => void;
};

export const EditForm = (props: EditProps) => {
    const { editing, changeEditing } = props;
    const dataRef = useRef<Partial<PersonalInfoDetail> | null>(null);
    const sourceTagListRef = useRef<TagOption[]>();
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [mainLoading, setMainloading] = useState(false);
    const [formHeader, setFormHeader] = useState<FormHeader>();
    const { selectedId, selectedItem, setSelectedId } = useList();
    const { tags = [] } = useTag();
    const hasSelected = selectedId && selectedId !== -1 ? true : false;

    const submitClick = () => {
        formRef.current?.submit();
    };

    const handleCancel = () => {
        setSelectedId(-1);
    };

    const getDetail = async () => {
        setMainloading(true);
        var item = selectedItem as VaultItemView<any>;
        if (item) {
            const cryptoService = new TCryptoService();
            const plainContent = await cryptoService.decryptText(item.detail.content, true);

            const detail: PersonalInfoDetail = JSON.parse(plainContent);
            dataRef.current = { ...detail };
            setFormHeader({
                title: detail.title,
                Icon: IconMap(VaultItemType.PersonalInfo, FORM_ICON_SIZE),
            });
            form.setFieldsValue({ title: detail.title });
            form.setFieldsValue({ fullName: detail.fullName });
            form.setFieldsValue({ email: detail.email });
            form.setFieldsValue({ phone: detail.phone });
            form.setFieldsValue({ address1: detail.address1 });
            form.setFieldsValue({ address2: detail.address2 });
            form.setFieldsValue({ city: detail.city });
            form.setFieldsValue({ province: detail.province });
            form.setFieldsValue({ zipCode: detail.zipCode });
            form.setFieldsValue({ country: detail.country });
            form.setFieldsValue({ note: detail.note });
            form.setFieldsValue({ id: selectedItem });
            const tags = item.tags?.map((v: { id: string; name: string }) => ({
                id: v.id!,
                value: v.name,
            }));
            setTagList(tags!);
            sourceTagListRef.current = [...tags!];
        }
        setTimeout(() => setMainloading(false), 100);
    };

    useEffect(() => {
        if (hasSelected) {
            getDetail();
        }
    }, [selectedId]);

    const handleClose = (updatedValues: PersonalInfoDetail, tagIds: string[]) => {
        setFormHeader({
            title: updatedValues.title,
            Icon: IconMap(VaultItemType.PersonalInfo, FORM_ICON_SIZE),
        });
        dataRef.current = { ...updatedValues };
        sourceTagListRef.current = tags.filter((tag) => tagIds.find((id) => id === tag.id));
        changeEditing(false);
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const isEmptyField = (fieldName: string) => {
        return form.getFieldValue(fieldName) == '' || !form.getFieldValue(fieldName);
    };

    const handleFieldVisible = (fieldName: string): string => {
        const isEmptyAddressGroup = () => {
            return (
                isEmptyField('address1') &&
                isEmptyField('address2') &&
                isEmptyField('city') &&
                isEmptyField('province') &&
                isEmptyField('zipCode') &&
                isEmptyField('country')
            );
        };

        if (!editing) {
            switch (fieldName) {
                case 'groupAddress':
                    return isEmptyAddressGroup() ? 'none' : 'flex';
                case 'groupOther':
                    return isEmptyField('note') ? 'none' : 'block';
                default:
                    return isEmptyField(fieldName) ? 'none' : 'block';
            }
        }

        return 'block';
    };

    return (
        <div className={styles.wrapper}>
            <AppForm
                visible={hasSelected}
                editLoading={mainLoading}
                onSave={submitClick}
                onCancel={handleCancel}
                onEdit={changeEditing}
                isEdit={editing}
                loadingVisible={loading}
                formHeader={formHeader}
            >
                <div style={{ padding: '0 10px 0 5px', width: '100%' }}>
                    <FormContent
                        onUpdate={handleClose}
                        isNewItem={false}
                        ref={formRef}
                        form={form}
                        isEdit={editing}
                        tags={tagList.map((tag) => tag.value)}
                        changeLoadingState={(edit) => setLoading(edit)}
                        visible={handleFieldVisible}
                    />
                    <div style={{ marginTop: '30px' }}>
                        <Tag
                            selectedTags={tagList}
                            onSelectedChanged={onSelectedTagChange}
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
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);

    const clearForm = () => {
        form.setFieldsValue({
            title: '',
            fullName: '',
            email: '',
            phone: '',
            address1: '',
            address2: '',
            city: '',
            province: '',
            zipCode: '',
            country: '',
            note: '',
        });
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const onDiscardNew = () => {
        clearForm();
        setTagList([]);
        changeNew(false);
    };

    const handleFieldVisible = (fieldName: string): string => {
        return 'block';
    };

    return (
        <SimpleModal
            width={600}
            close={onDiscardNew}
            loading={loading}
            onOk={() => {
                formRef.current?.submit();
            }}
            title={<FormattedMessage id="vault.personalInfo.title" />}
        >
            <ScrollContainter style={{ height: 460 }}>
                <div style={{ padding: '20px 20px 0 20px' }}>
                    <FormContent
                        isNewItem={true}
                        isEdit={true}
                        ref={formRef}
                        form={form}
                        onUpdate={onDiscardNew}
                        changeLoadingState={(edit) => setLoading(edit)}
                        tags={tagList.map((tag) => tag.value)}
                        visible={handleFieldVisible}
                    />
                    <div style={{ width: '100%', height: 20 }}></div>
                    <Tag
                        selectedTags={tagList}
                        onSelectedChanged={onSelectedTagChange}
                        buttonVisable={true}
                    ></Tag>
                </div>
            </ScrollContainter>
        </SimpleModal>
    );
};
