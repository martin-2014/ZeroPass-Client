import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag from '@/pages/Home/components/Tag';
import { cryptoServiceAPI as restAPI } from '@/secretKey/cryptoService/api/cryptoService';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import {
    getPersonalItemTags,
    CreditCardDetail,
    VaultItemView,
    VaultItemType,
} from '@/services/api/vaultItems';
import { Form, FormInstance } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';
import { useList, useTag } from '../../Context/hooks';
import { TagOption } from '../../datatypes';
import FormContent from './Form';
import styles from './index.less';
import { FORM_ICON_SIZE, getImgUriByType } from '../../tools';
import IconMap from '../IconMap';
import Image from '@/components/Image';

type EditProps = {
    editing: boolean;
    changeEditing: (value: boolean) => void;
};

export const EditForm = (props: EditProps) => {
    const { editing, changeEditing } = props;
    const originalFormData = useRef<CreditCardDetail | null>(null);
    const originalSelectedTags = useRef<TagOption[]>();
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [mainLoading, setMainloading] = useState(false);
    const [formHeader, setFormHeader] = useState<FormHeader>();
    const { selectedId, selectedItem, setSelectedId } = useList();
    const [headerImgUri, setHeaderImgUri] = useState('');
    const [showCvv, setShowCvv] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const { tags = [] } = useTag();
    const hasSelected = selectedId && selectedId !== -1 ? true : false;

    const submitForm = () => {
        formRef.current?.submit();
    };

    const onCancel = () => {
        setSelectedId(-1);
    };

    const getDetail = async () => {
        setMainloading(true);
        var item = selectedItem as VaultItemView<any>;
        if (item) {
            const cryptoService = new TCryptoService();
            const content = await cryptoService.decryptText(item.detail.content, true);

            const detail: CreditCardDetail = JSON.parse(content);
            const fieldValues = {
                title: detail.title,
                holder: detail.holder,
                number: detail.number,
                expiry: detail.expiry,
                cvv: detail.cvv,
                zipOrPostalCode: detail.zipOrPostalCode,
                pin: detail.pin,
                note: detail.note,
            };
            originalFormData.current = { ...fieldValues };

            const headerUri = getImgUriByType(item.detail.cardType);
            setFormHeader({
                title: detail.title,
                Icon: (
                    <Image
                        src={headerUri}
                        defaulticon={IconMap(VaultItemType.CreditCard, FORM_ICON_SIZE)}
                    ></Image>
                ),
            });

            form.setFieldsValue(fieldValues);
            setHeaderImgUri(headerUri);
            setShowCvv(false);
            setShowPin(false);
            const tags = item.tags?.map((v: { id: string; name: string }) => ({
                id: v.id!,
                value: v.name,
            }));
            setTagList(tags!);
            originalSelectedTags.current = [...tags!];
        }
        setTimeout(() => setMainloading(false), 100);
    };

    useEffect(() => {
        if (hasSelected) {
            getDetail();
        }
    }, [selectedId]);

    const onUpdate = (
        updatedValues: CreditCardDetail,
        tagIds: (number | string)[],
        imgUri: string,
    ) => {
        setFormHeader({
            title: updatedValues.title,
            Icon: (
                <Image
                    src={imgUri}
                    defaulticon={IconMap(VaultItemType.CreditCard, FORM_ICON_SIZE)}
                ></Image>
            ),
        });
        originalFormData.current = { ...updatedValues };
        originalSelectedTags.current = tags.filter((tag) => tagIds.find((id) => id === tag.id));
        changeEditing(false);
        setShowCvv(false);
        setShowPin(false);
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    return (
        <div className={styles.wrapper}>
            <AppForm
                visible={hasSelected}
                editLoading={mainLoading}
                onSave={submitForm}
                onCancel={onCancel}
                onEdit={changeEditing}
                isEdit={editing}
                loadingVisible={loading}
                formHeader={formHeader}
            >
                <div style={{ padding: '0 10px 0 5px', width: '100%' }}>
                    <FormContent
                        onUpdate={onUpdate}
                        isNewItem={false}
                        ref={formRef}
                        form={form}
                        isEdit={editing}
                        tags={tagList.map((tag) => tag.value)}
                        changeLoadingState={(edit) => setLoading(edit)}
                        headerUri={headerImgUri}
                        showCvv={showCvv}
                        onShowCvv={setShowCvv}
                        showPin={showPin}
                        onShowPin={setShowPin}
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
        form.resetFields();
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const onDiscardNew = () => {
        clearForm();
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
            title={<FormattedMessage id="vault.creditCard.title" />}
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
