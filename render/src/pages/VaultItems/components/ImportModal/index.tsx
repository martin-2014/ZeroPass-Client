import HubAlert from '@/components/HubAlert';
import SimpleModal from '@/components/SimpleModal';
import message from '@/utils/message';
import { InboxOutlined } from '@ant-design/icons';
import { Form, Upload, Progress, List } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { cryptoServiceAPI as restAPI } from '@/secretKey/cryptoService/api/cryptoService';
import { createLogin, AppDetail } from '@/services/api/logins';
import * as csvWriter from 'csv-writer';
import moment from 'moment';
import { downloadFile, utf8BOM } from '@/utils/secretKeyDownloader';
import { CSVToArray } from '@/utils/csv';
import { Result } from '@/services/api/requester';

const { Dragger } = Upload;

interface PropsItem {
    visible: boolean;
    close: () => void;
    reload: () => void;
}

export const CsvFields = {
    name: 'Title',
    userName: 'Login Name',
    password: 'Password',
    url: 'Login Page URL',
};

const ImportWebLogins = (props: PropsItem) => {
    const draggerProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        beforeUpload(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                csvText.current = e.target.result;
            };
            reader.readAsText(file);
            // Prevent upload
            return false;
        },
    };

    const Intl = useIntl();
    const formRef = useRef(null);
    const [loading, setLoading] = useState<boolean>(false);
    const csvText = useRef('');
    const [completePercent, setCompletePercent] = useState<Number>(0);
    const [processVisible, setProcessvisible] = useState<string>('none');
    const [errorLines, setErrorLines] = useState<string[]>([]);

    const headerLength = 4;

    const onFinish = async () => {
        const getErrorLine = (line: number): string => {
            let allTextLines = csvText.current.split(/\r\n|\n/);
            return allTextLines[line];
        };

        setLoading(true);
        try {
            let csvArray = CSVToArray(csvText.current);
            if (!verifyFile(csvArray)) {
                message.error(Intl.formatMessage({ id: 'pages.import.format.error' }));
                return;
            }
            setProcessvisible('');

            setErrorLines([]);
            let errors: string[] = [];
            for (let i = 1; i < csvArray.length; i++) {
                let data = csvArray[i];
                if (data.length == headerLength) {
                    let entity = new Map<string, string>();
                    entity.set(CsvFields.name, data[0]);
                    entity.set(CsvFields.userName, data[1]);
                    entity.set(CsvFields.password, data[2]);
                    entity.set(CsvFields.url, data[3]);

                    const response = await ImportOneLine(entity);
                    if (response.fail) {
                        errors.push(Intl.formatMessage({ id: response.errorId }));
                        errors.push(getErrorLine(i));
                        setErrorLines(errors);
                    }
                }

                let percent = Math.round((i / (csvArray.length - 1)) * 100);
                setCompletePercent(percent);
            }
            props.reload();
            if (errors.length == 0) {
                props.close();
            }
        } finally {
            setLoading(false);
        }
    };

    const ImportOneLine = async (data: Map<string, any>): Promise<Result<any>> => {
        let cryptoService = new TCryptoService();
        const password = await cryptoService.encryptText(data.get(CsvFields.password), false);

        const item: AppDetail = {
            description: data.get(CsvFields.name),
            loginUser: data.get(CsvFields.userName),
            loginPassword: password,
            loginUri: data.get(CsvFields.url),
            clientMachineId: null,
            tagIds: [],
            tags: [],
            accesses: [],
        };

        return await createLogin(item);
    };

    const verifyFile = (csvArrray: string[][]): boolean => {
        if (csvArrray.length <= 1) {
            return false;
        }
        if (!verifyFileHeader(csvArrray[0])) {
            return false;
        }
        return true;
    };

    const verifyFileHeader = (header: string[]): boolean => {
        if (header.length != headerLength) {
            return false;
        }
        if (
            !header.includes(CsvFields.name) ||
            !header.includes(CsvFields.userName) ||
            !header.includes(CsvFields.password) ||
            !header.includes(CsvFields.url)
        ) {
            return false;
        }
        return true;
    };

    const importData = async () => {
        formRef.current?.submit();
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const downloadTemplate = () => {
        const createCsvWriter = csvWriter.createObjectCsvStringifier;
        const writer = createCsvWriter({
            header: [
                { id: 'name', title: CsvFields.name },
                { id: 'userName', title: CsvFields.userName },
                { id: 'password', title: CsvFields.password },
                { id: 'url', title: CsvFields.url },
            ],
        });
        let result = {};
        result['name'] = '[your title]';
        result['userName'] = '[your login name]';
        result['password'] = '[your password]';
        result['url'] = '[your login page url]';

        const content = `${utf8BOM}${writer.getHeaderString()}${writer.stringifyRecords([result])}`;
        let fileName = `Login-Template-${moment().format('YYYYMMDD')}.csv`;
        downloadFile(fileName, content);
    };

    useEffect(() => {
        if (!props.visible) {
            setCompletePercent(0);
            setProcessvisible('none');
            setErrorLines([]);
        }
    }, [props.visible]);

    const downloadErrors = () => {
        const content = errorLines.join('\n');
        let fileName = `Login-Errors-${moment().format('YYYYMMDD')}.txt`;
        downloadFile(fileName, content);
    };

    const handleClose = () => {
        if (loading) {
            message.infoIntl('pages.import.inProgress.hint');
        } else {
            props.close();
        }
    };

    return (
        <>
            <SimpleModal
                visible={props.visible}
                loading={loading}
                close={handleClose}
                width={500}
                title={Intl.formatMessage({ id: 'vault.import.title' })}
                closable
                okText={Intl.formatMessage({ id: 'common.import' })}
                onOk={importData}
                destroyOnClose
            >
                <Form
                    style={{ width: '100%' }}
                    onFinish={onFinish}
                    ref={formRef}
                    className={StyleSheet.main}
                >
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
                                            id: 'pages.import.hint.line1.before',
                                        })}
                                    </span>
                                    <a onClick={downloadTemplate}>
                                        {Intl.formatMessage({
                                            id: 'pages.import.hint.line1.middle',
                                        })}
                                    </a>
                                    <span>
                                        {Intl.formatMessage({
                                            id: 'pages.import.hint.line1.after',
                                        })}
                                    </span>
                                </div>
                            }
                        />
                        <HubAlert msg={Intl.formatMessage({ id: 'pages.import.hint.line2' })} />
                    </Form.Item>
                    <Form.Item noStyle>
                        <Progress
                            percent={completePercent}
                            style={{ display: processVisible, marginTop: '10px' }}
                        />
                    </Form.Item>
                    <Form.Item noStyle>
                        <a
                            style={{
                                display: errorLines.length > 0 ? '' : 'none',
                                marginTop: '10px',
                                color: 'red',
                            }}
                            onClick={downloadErrors}
                        >
                            <FormattedMessage id="pages.import.errorList.download" />
                        </a>
                    </Form.Item>
                </Form>
            </SimpleModal>
        </>
    );
};

export default ImportWebLogins;
