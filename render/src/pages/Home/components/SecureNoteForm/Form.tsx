import useTagList from '@/hooks/useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { errHandlers } from '@/services/api/errHandlers';
import { SecureNoteDetail, VaultItemType } from '@/services/api/vaultItems';
import message from '@/utils/message';
import { Form, FormInstance, Input } from 'antd';
import React from 'react';
import { useIntl } from 'umi';
import { useList } from '@/pages/Home/Context/hooks';
import FormInput from '@/components/Form/FormInput';
import FormItem from '@/components/Form/FormItem';
import FormGroup from '@/components/Form/FormGroup';
import Header from '../Header';
import styles from './index.less';
import IconMap from '../IconMap';
import { FORM_ICON_SIZE } from '../../tools';

type Props = {
    form: FormInstance<any>;
    onUpdate?: (updatedValues: SecureNoteDetail, tagIds: string[]) => void;
    changeLoadingState?: (load: boolean) => void;
    tags?: string[];
    isEdit: boolean;
    isNewItem?: boolean;
};
const FormContent = React.forwardRef((props: Props, ref: any) => {
    const { isNewItem, form, onUpdate, changeLoadingState, tags = [], isEdit } = props;
    const Intl = useIntl();
    const { personal, selectedId } = useList();
    const { setNewTag } = useTagList();
    const handleFinish = async (form: FormInstance<any>) => {
        let data = form.getFieldsValue();
        const id = selectedId;
        const title = data.title.trim();
        changeLoadingState?.(true);

        const detail: SecureNoteDetail = {
            title: title,
            note: data.note,
        };

        var cryptoService = new TCryptoService();
        var plainContent = JSON.stringify(detail);
        const content = {};
        content['content'] = await cryptoService.encryptText(plainContent, true);

        const requester = isNewItem ? personal.create : personal.update;
        const response = await requester({
            id: id,
            name: title,
            description: '',
            type: VaultItemType.SecureNodes,
            detail: content,
            tags: tags,
        });
        changeLoadingState?.(false);
        if (!response.fail) {
            message.successIntl('common.save.success', 3);
            onUpdate?.(detail, tags);
            setNewTag();
        } else {
            errHandlers.default(response);
        }

        changeLoadingState?.(false);
    };
    return (
        <Form
            ref={ref}
            onFinish={() => {
                handleFinish(form);
            }}
            layout="vertical"
            name="basic"
            initialValues={{ remember: true }}
            autoComplete="off"
            requiredMark="optional"
            form={props.form}
            style={{ width: '100%' }}
        >
            <FormItem
                name="title"
                rules={[
                    {
                        required: true,
                        whitespace: false,
                    },
                ]}
                noStyle
            >
                <Header
                    isEdit={isEdit || isNewItem}
                    Icon={IconMap(VaultItemType.SecureNodes, FORM_ICON_SIZE)}
                    placeholder={Intl.formatMessage({ id: 'vault.title' }) + '*'}
                    style={{
                        display: isEdit === false && isNewItem === false ? 'none' : '',
                    }}
                />
            </FormItem>
            <FormGroup>
                <FormItem name="note" noStyle>
                    <FormInput
                        title="vault.secureNote.form.note"
                        wrapperStyle={{
                            display:
                                isNewItem || isEdit || form.getFieldValue('note') ? '' : 'none',
                        }}
                        isEdit={isNewItem || isEdit}
                        copyValue={() => form.getFieldValue('note')}
                    >
                        <Input.TextArea
                            autoSize={{ minRows: 10, maxRows: Number.MAX_SAFE_INTEGER }}
                        />
                    </FormInput>
                </FormItem>
            </FormGroup>
            <Form.Item name="id" hidden={true}>
                <Input />
            </Form.Item>
        </Form>
    );
});
export default FormContent;
