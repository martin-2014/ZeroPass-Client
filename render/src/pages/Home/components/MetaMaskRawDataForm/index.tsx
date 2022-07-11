import ScrollContainter from '@/components/ScrollContainter';
import SimpleModal from '@/components/SimpleModal';
import AppForm, { FormHeader } from '@/pages/Home/components/BaseForm';
import Tag from '@/pages/Home/components/Tag';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { MetaMaskRawDataDetail, VaultItemType, VaultItemView } from '@/services/api/vaultItems';
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
    const dataRef = useRef<Partial<MetaMaskRawDataDetail>>();
    const sourceTagListRef = useRef<TagOption[]>();
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>();
    const [loading, setLoading] = useState(false);
    const [tagList, setTagList] = useState<TagOption[]>([]);
    const [mainLoading, setMainloading] = useState(false);
    const [formHeader, setFormHeader] = useState<FormHeader>();
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowLocateWallet, setIsShowLocateWallet] = useState(false);
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
        var item = selectedItem as VaultItemView<MetaMaskRawDataDetail>;
        if (item) {
            const detail: MetaMaskRawDataDetail = item.detail;
            const cryptoService = new TCryptoService();
            const walletPassword = detail.walletPassword
                ? await cryptoService.decryptText(detail.walletPassword, true)
                : '';
            dataRef.current = { ...detail, walletPassword };
            setFormHeader({
                title: item.name,
                Icon: IconMap(VaultItemType.MetaMaskRawData, FORM_ICON_SIZE),
            });
            form.setFieldsValue({
                id: selectedId,
                title: detail?.title,
                dataFile: detail.dataFile,
                walletPassword: walletPassword,
                note: detail.note,
            });
            const tags = item.tags?.map((v: { id: string; name: string }) => ({
                id: v.id!,
                value: v.name,
            }));
            setIsShowPassword(false);
            setIsShowLocateWallet(false);
            setTagList(tags!);
            sourceTagListRef.current = [...tags!];
        }
        setMainloading(false);
    };

    useEffect(() => {
        getDetail();
    }, [selectedId]);

    const handleClose = (updatedValues: MetaMaskRawDataDetail, tagIds: (number | string)[]) => {
        setFormHeader({
            title: updatedValues.title,
            Icon: IconMap(VaultItemType.MetaMaskRawData, FORM_ICON_SIZE),
        });
        dataRef.current = { ...updatedValues };
        sourceTagListRef.current = tags.filter((tag) => tagIds.find((id) => id === tag.id));
        changeEditing(false);
        setIsShowPassword(false);
        setIsShowLocateWallet(false);
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const handleBackupChange = (val: string) => {
        form.setFieldsValue({ dataFile: val });
        setIsShowLocateWallet(!val);
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
                        originalBackup={dataRef.current?.dataFile}
                        onShowPassword={setIsShowPassword}
                        isShowPassWord={isShowPassword}
                        onBackupChange={handleBackupChange}
                        isShowLocateWallet={isShowLocateWallet}
                    />
                    <Row
                        style={{
                            marginTop: '5px',
                            marginBottom: '10px',
                            display: editing || tagList.length > 0 ? '' : 'none',
                        }}
                    >
                        <Col span={24}>
                            <span className="hubFontColorNormal">
                                <FormattedMessage id="vault.tags" />
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
    const [isShowLocateWallet, setIsShowLocateWallet] = useState(true);

    const clearForm = () => {
        form.setFieldsValue({
            title: '',
            dataFile: '',
            walletPassword: '',
            note: '',
        });
        setIsShowLocateWallet(true);
    };

    const onSelectedTagChange = (data: TagOption[]) => {
        setTagList(data);
    };

    const handleClose = () => {
        clearForm();
        setTagList([]);
        changeNew(false);
    };

    const handleUpdate = () => {
        clearForm();
        setTagList([]);
        changeNew(false);
    };

    const handleBackupChange = (val: string) => {
        form.setFieldsValue({ dataFile: val });
        setIsShowLocateWallet(!val);
    };

    return (
        <SimpleModal
            width={600}
            close={handleClose}
            loading={loading}
            onOk={() => {
                formRef.current?.submit();
            }}
            title={<FormattedMessage id="vault.metaMaskRawData.title" />}
        >
            <ScrollContainter style={{ height: 460 }}>
                <div style={{ padding: '20px 20px 0 20px' }}>
                    <FormContent
                        isNewItem={true}
                        isEdit={true}
                        ref={formRef}
                        form={form}
                        onUpdate={handleUpdate}
                        changeLoadingState={(edit) => setLoading(edit)}
                        tags={tagList.map((tag) => tag.value)}
                        onBackupChange={handleBackupChange}
                        isShowLocateWallet={isShowLocateWallet}
                    />
                    <Row style={{ marginTop: '5px', marginBottom: '10px' }}>
                        <Col span={24}>
                            <span className="hubFontColorNormal">
                                <FormattedMessage id="vault.tags" />
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
