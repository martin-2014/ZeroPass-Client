import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag, { Option } from '@/pages/Home/components/Tag';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { SecureNoteDetail, VaultItemType, VaultItemView } from '@/services/api/vaultItems';
import { Form, FormInstance } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';
import { useList, useTag } from '../../Context/hooks';
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
    const dataRef = useRef<Partial<SecureNoteDetail> | null>(null);
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<Option[]>([]);
    const originalTagList = useRef<Option[]>();
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

            const detail: SecureNoteDetail = JSON.parse(plainContent);
            dataRef.current = detail;
            setFormHeader({
                title: detail.title,
                Icon: IconMap(VaultItemType.SecureNodes, FORM_ICON_SIZE),
            });
            form.setFieldsValue({ title: detail.title });
            form.setFieldsValue({ note: detail.note });
            form.setFieldsValue({ id: selectedId });
            const tags = item.tags?.map((v: { id: string; name: string }) => ({
                id: v.id!,
                value: v.name,
            }));
            setTagList(tags!);
            originalTagList.current = [...tags!];
        }
        setTimeout(() => setMainloading(false), 100);
    };

    useEffect(() => {
        if (hasSelected) {
            getDetail();
        }
    }, [selectedId]);

    const handleClose = (updatedValues: SecureNoteDetail, tagIds: string[]) => {
        setFormHeader({
            title: updatedValues.title,
            Icon: IconMap(VaultItemType.SecureNodes, FORM_ICON_SIZE),
        });
        dataRef.current = { ...updatedValues };
        originalTagList.current = tags.filter((tag) => tagIds.find((id) => id === tag.id));
        changeEditing(false);
    };

    const handleChangeTagList = (data: Option[]) => {
        setTagList(data);
    };

    return (
        <div className={styles.wrapper}>
            <AppForm
                editLoading={mainLoading}
                onSave={submitClick}
                onCancel={handleCancel}
                onEdit={changeEditing}
                isEdit={editing}
                loadingVisible={loading}
                formHeader={formHeader}
                visible={hasSelected}
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
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<Option[]>([]);

    const clearForm = (form: FormInstance) => {
        form.setFieldsValue({ title: '', note: '' });
    };

    const onSelectedTagsChange = (data: Option[]) => {
        setTagList(data);
    };

    const onDiscardNew = () => {
        clearForm(form);
        setTagList([]);
        changeNew(false);
    };

    return (
        <SimpleModal
            width={600}
            close={onDiscardNew}
            loading={loading}
            onOk={() => {
                formRef.current?.submit();
            }}
            title={<FormattedMessage id="vault.secureNote.title" />}
        >
            <ScrollContainter style={{ height: 445 }}>
                <div style={{ padding: '20px 20px 0 20px' }}>
                    <FormContent
                        isNewItem={true}
                        isEdit={true}
                        ref={formRef}
                        form={form}
                        onUpdate={onDiscardNew}
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
