import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag from '@/pages/Home/components/Tag';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import {
    MetaMaskMnemonicPhraseDetail,
    VaultItemType,
    VaultItemView,
} from '@/services/api/vaultItems';
import { Col, Form, FormInstance, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';
import { useList, useTag } from '@/pages/Home/Context/hooks';
import { TagOption } from '../../datatypes';
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
    const dataRef = useRef<Partial<MetaMaskMnemonicPhraseDetail> | null>(null);
    const sourceTagListRef = useRef<TagOption[]>();
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [mainLoading, setMainloading] = useState(false);
    const [formHeader, setFormHeader] = useState<FormHeader>();
    const { selectedId, selectedItem, setSelectedId } = useList();
    const { tags = [] } = useTag();
    const [showMnemonicPhrase, setShowMnemonicPhrase] = useState(false);
    const [showWalletPassword, setShowWalletPassword] = useState(false);
    const originalMnemonicPhrase = useRef('');
    const hiddenMnemonicPhrase = useRef('');
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
            const plainContent = await cryptoService.decryptText(item.detail.content, true);

            const detail: MetaMaskMnemonicPhraseDetail = JSON.parse(plainContent);
            dataRef.current = { ...detail };
            setFormHeader({
                title: detail.title,
                Icon: IconMap(VaultItemType.MetaMaskMnemonicPhrase, FORM_ICON_SIZE),
            });
            form.setFieldsValue({ title: detail.title });
            setMnemonicPhraseValue(detail.mnemonicPhrase);
            form.setFieldsValue({ walletPassword: detail.walletPassword });
            form.setFieldsValue({ defaultNetwork: detail.defaultNetwork });
            form.setFieldsValue({ note: detail.note });
            form.setFieldsValue({ id: selectedItem });
            setShowMnemonicPhrase(false);
            setShowWalletPassword(false);
            setMnemonicPhraseField(false);
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
        getDetail();
    }, [selectedId]);

    const onUpdate = (updatedValues: MetaMaskMnemonicPhraseDetail, tagIds: string[]) => {
        setFormHeader({
            title: updatedValues.title,
            Icon: IconMap(VaultItemType.MetaMaskMnemonicPhrase, FORM_ICON_SIZE),
        });
        dataRef.current = { ...updatedValues };
        setMnemonicPhraseValue(updatedValues.mnemonicPhrase);
        sourceTagListRef.current = tags.filter((tag) => tagIds.find((id) => id === tag.id));
        setMnemonicPhraseField(false);
        changeEditing(false);
        setShowMnemonicPhrase(false);
        setShowWalletPassword(false);
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const getTagsSectiondDisplay = () => {
        return editing || tagList.length > 0 ? '' : 'none';
    };

    const handelShowMnemonicPhrase = (isShow: boolean) => {
        setShowMnemonicPhrase(isShow);
        setMnemonicPhraseField(isShow);
    };

    const setMnemonicPhraseField = (isShow: boolean) => {
        if (isShow) {
            form.setFieldsValue({ mnemonicPhrase: originalMnemonicPhrase.current });
        } else {
            form.setFieldsValue({ mnemonicPhrase: hiddenMnemonicPhrase.current });
        }
    };

    const setMnemonicPhraseValue = (mnemonicPhrase: string) => {
        originalMnemonicPhrase.current = mnemonicPhrase;
        hiddenMnemonicPhrase.current = mnemonicPhrase.replace(/./g, '*');
    };

    const handleGetMnemonicPhrase = (): string => {
        return originalMnemonicPhrase.current;
    };

    const handleEditing = () => {
        changeEditing(true);
        form.setFieldsValue({ mnemonicPhrase: originalMnemonicPhrase.current });
    };

    return (
        <div className={styles.wrapper}>
            <AppForm
                visible={hasSelected}
                editLoading={mainLoading}
                onSave={submitForm}
                onCancel={onCancel}
                onEdit={handleEditing}
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
                        showMnemonicPhrase={showMnemonicPhrase}
                        onShowMnemonicPhrase={handelShowMnemonicPhrase}
                        getMnemonicPhraseValue={handleGetMnemonicPhrase}
                        showWalletPassword={showWalletPassword}
                        onShowWalletPassword={setShowWalletPassword}
                    />
                    <Row
                        style={{
                            marginTop: '5px',
                            marginBottom: '10px',
                            display: getTagsSectiondDisplay(),
                        }}
                    >
                        <Col span={24}>
                            <span className="hubFontColorNormal">
                                <FormattedMessage id="valut.section.tags" />
                            </span>
                        </Col>
                    </Row>
                    <Tag
                        selectedTags={tagList}
                        onSelectedChanged={onSelectedTagChange}
                        buttonVisable={editing}
                    ></Tag>
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
            title={<FormattedMessage id="vault.MetaMaskMnemonicPhrase.title" />}
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
                    <Row style={{ marginTop: '5px', marginBottom: '10px' }}>
                        <Col span={24}>
                            <span className="hubFontColorNormal">
                                <FormattedMessage id="valut.section.tags" />
                            </span>
                        </Col>
                    </Row>
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
