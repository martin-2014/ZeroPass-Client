import HubAlert from '@/components/HubAlert';
import SimpleModal from '@/components/SimpleModal';
import message from '@/utils/message';
import { InboxOutlined } from '@ant-design/icons';
import { Form, FormInstance, Upload } from 'antd';
import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import moment from 'moment';
import { downloadFile, utf8BOM } from '@/utils/secretKeyDownloader';
import { parseCsv } from '@/utils/csv';
import { DraggerProps } from 'antd/lib/upload';
import { VaultItemType } from '@/services/api/vaultItems';
import React from 'react';
import { useList } from '@/pages/Home/Context/hooks';
import { createParser } from '../../../../utils/csvParser/factory';

const { Dragger } = Upload;

interface PropsItem {
    type: VaultItemType;
    close: () => void;
}

const ImportItems: React.FC<PropsItem> = ({ type, close }) => {
    const Intl = useIntl();
    const { personal } = useList();
    const [loading, setLoading] = useState<boolean>(false);
    const [failedContent, setFailedContent] = useState<string>();
    const formRef = useRef<FormInstance>(null);
    const csvText = useRef('');
    const mapper = createParser(type);

    const draggerProps: DraggerProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        beforeUpload(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                csvText.current = e.target?.result as string;
            };
            reader.readAsText(file);
            return false;
        },
        onChange: () => {
            setFailedContent('');
        },
    };

    const onFinish = async () => {
        setLoading(true);
        const res = parseCsv(csvText.current, mapper.requiredHeaders);
        const { result, objects = [], failContent = '' } = res;
        if (result !== 'success' && result !== 'partialSuccess') {
            message.errorIntl('pages.import.format.error');
            setLoading(false);
            return;
        }
        const items = await mapper.parseItems(objects);
        await personal.import(items);
        if (result === 'success') {
            close();
        } else {
            setFailedContent(failContent);
            setLoading(false);
        }
    };

    const handleOk = () => {
        formRef.current?.submit();
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const downloadTemplate = () => {
        const content = `${utf8BOM}${mapper.csvSample}`;
        const fileName = `import-template-${moment().format('YYYYMMDD')}.csv`;
        downloadFile(fileName, content);
    };

    const downloadErrors = () => {
        const fileName = `import-errors-${moment().format('YYYYMMDD')}.csv`;
        downloadFile(fileName, `${utf8BOM}${failedContent}`);
    };

    return (
        <>
            <SimpleModal
                visible={true}
                loading={loading}
                close={close}
                width={500}
                title={Intl.formatMessage({ id: 'pages.importLogin.title' })}
                closable
                okText={Intl.formatMessage({ id: 'common.import' })}
                onOk={handleOk}
                destroyOnClose
            >
                <Form style={{ width: '100%' }} onFinish={onFinish} ref={formRef}>
                    <Form.Item
                        name={'file'}
                        getValueFromEvent={normFile}
                        rules={[
                            {
                                required: true,
                                message: Intl.formatMessage({ id: 'pages.import.empty.error' }),
                            },
                        ]}
                    >
                        <Dragger {...draggerProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                {Intl.formatMessage({ id: 'pages.import.upload.title' })}
                            </p>
                        </Dragger>
                    </Form.Item>
                    <Form.Item noStyle>
                        <HubAlert
                            msg={
                                <div>
                                    <span>
                                        {Intl.formatMessage({
                                            id: 'pages.importLogin.hint.line1.before',
                                        })}
                                    </span>
                                    <a onClick={downloadTemplate}>
                                        {Intl.formatMessage({
                                            id: 'pages.importLogin.hint.line1.middle',
                                        })}
                                    </a>
                                    <span>
                                        {Intl.formatMessage({
                                            id: 'pages.importLogin.hint.line1.after',
                                        })}
                                    </span>
                                </div>
                            }
                        />
                    </Form.Item>
                    {failedContent && (
                        <Form.Item noStyle>
                            <a
                                style={{
                                    marginTop: '10px',
                                    color: 'red',
                                }}
                                onClick={downloadErrors}
                            >
                                <FormattedMessage id="pages.import.errorList.download" />
                            </a>
                        </Form.Item>
                    )}
                </Form>
            </SimpleModal>
        </>
    );
};

export default ImportItems;
