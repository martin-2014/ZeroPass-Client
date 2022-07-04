import HubAlert from '@/components/HubAlert';
import SimpleModal from '@/components/SimpleModal';
import message from '@/utils/message';
import { InboxOutlined } from '@ant-design/icons';
import { Form, Upload, Progress } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import * as csvWriter from 'csv-writer';
import moment from 'moment';
import { downloadFile, utf8BOM } from '@/utils/secretKeyDownloader';
import { createClient } from '@/services/api/clients';
import { CSVToArray } from '@/utils/csv';
import { Result } from '@/services/api/requester';

const { Dragger } = Upload;

interface PropsItem {
    visible: boolean;
    close: () => void;
    reload: () => void;
}
export const CsvFields = {
    description: 'Client Container Description',
    remark: 'Remark',
    isActive: 'IsActive',
    ip: 'IP',
    clientOS: 'Client OS',
    clientVersion: 'Client Version',
    clientMachineCode: 'Client Machine Code',
    isDynamicalIP: 'Is Dynamical IP',
    ipCountry: 'IP Country',
    timeZone: 'Time Zone',
    gmt: 'GMT',
    attribution: 'Attribution',
    language: 'Language',
    uaWidowns: 'UA Windows',
    uaMac: 'UA Mac',
    uaLinux: 'UA Linux',
    isCustomizedUA: 'Is Customized UA',
    isSyncCookieByUser: 'Is Sync Cookie By User',
    proxyType: 'Proxy Type',
    proxyIp: 'Proxy IP',
    proxyPort: 'Proxy Port',
    proxyUserName: 'Proxy User Name',
    proxyPassword: 'Proxy Password',
    proxyVersion: 'Proxy Version',
    proxyCountry: 'Proxy Country',
    proxyState: 'Proxy State',
    proxyCity: 'Proxy City',
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

    const headerLength = 27;

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
                    entity.set(CsvFields.description, data[0]);
                    entity.set(CsvFields.remark, data[1]);
                    entity.set(CsvFields.isActive, data[2]);
                    entity.set(CsvFields.ip, data[3]);
                    entity.set(CsvFields.clientOS, data[4]);
                    entity.set(CsvFields.clientVersion, data[5]);
                    entity.set(CsvFields.clientMachineCode, data[6]);
                    entity.set(CsvFields.isDynamicalIP, data[7]);
                    entity.set(CsvFields.ipCountry, data[8]);
                    entity.set(CsvFields.timeZone, data[9]);
                    entity.set(CsvFields.gmt, data[10]);
                    entity.set(CsvFields.attribution, data[11]);
                    entity.set(CsvFields.language, data[12]);
                    entity.set(CsvFields.uaWidowns, data[13]);
                    entity.set(CsvFields.uaMac, data[14]);
                    entity.set(CsvFields.uaLinux, data[15]);
                    entity.set(CsvFields.isCustomizedUA, data[16]);
                    entity.set(CsvFields.isSyncCookieByUser, data[17]);
                    entity.set(CsvFields.proxyType, data[18]);
                    entity.set(CsvFields.proxyIp, data[19]);
                    entity.set(CsvFields.proxyPort, data[20]);
                    entity.set(CsvFields.proxyUserName, data[21]);
                    entity.set(CsvFields.proxyPassword, data[22]);
                    entity.set(CsvFields.proxyVersion, data[23]);
                    entity.set(CsvFields.proxyCountry, data[24]);
                    entity.set(CsvFields.proxyState, data[25]);
                    entity.set(CsvFields.proxyCity, data[26]);

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
        const item = {
            clientOS: data.get(CsvFields.clientOS),
            clientVersion: data.get(CsvFields.clientVersion),
            clientMachineCode: data.get(CsvFields.clientMachineCode),
            realIp: data.get(CsvFields.ip),
            isDynamicalIp: JSON.parse(data.get(CsvFields.isDynamicalIP).toLowerCase()),
            ipCountry: data.get(CsvFields.ipCountry),
            timeZone: data.get(CsvFields.timeZone),
            gmt: data.get(CsvFields.gmt),
            attribution: data.get(CsvFields.attribution),
            language: data.get(CsvFields.language),
            uaWindows: data.get(CsvFields.uaWidowns),
            uaMac: data.get(CsvFields.uaMac),
            uaLinux: data.get(CsvFields.uaLinux),
            machineName: data.get(CsvFields.description),
            isActive: JSON.parse(data.get(CsvFields.isActive).toLowerCase()),
            isCustomizedUA: JSON.parse(data.get(CsvFields.isCustomizedUA).toLowerCase()),
            isSyncCookieByUser: JSON.parse(data.get(CsvFields.isSyncCookieByUser).toLowerCase()),
            description: data.get(CsvFields.remark),
            proxy: {
                type: data.get(CsvFields.proxyType),
                ip: data.get(CsvFields.proxyIp),
                port: data.get(CsvFields.proxyPort),
                username: data.get(CsvFields.proxyUserName),
                password: data.get(CsvFields.proxyPassword),
                version: JSON.parse(data.get(CsvFields.proxyVersion)),
                country: data.get(CsvFields.proxyCountry),
                state: data.get(CsvFields.proxyState),
                city: data.get(CsvFields.proxyCity),
                proxy_Type: '',
            },
        };

        return await createClient(item);
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
            !header.includes(CsvFields.description) ||
            !header.includes(CsvFields.remark) ||
            !header.includes(CsvFields.ip) ||
            !header.includes(CsvFields.isActive) ||
            !header.includes(CsvFields.clientOS) ||
            !header.includes(CsvFields.clientMachineCode) ||
            !header.includes(CsvFields.clientVersion) ||
            !header.includes(CsvFields.isDynamicalIP) ||
            !header.includes(CsvFields.ipCountry) ||
            !header.includes(CsvFields.timeZone) ||
            !header.includes(CsvFields.gmt) ||
            !header.includes(CsvFields.attribution) ||
            !header.includes(CsvFields.language) ||
            !header.includes(CsvFields.uaWidowns) ||
            !header.includes(CsvFields.uaLinux) ||
            !header.includes(CsvFields.uaMac) ||
            !header.includes(CsvFields.isCustomizedUA) ||
            !header.includes(CsvFields.isSyncCookieByUser) ||
            !header.includes(CsvFields.proxyType) ||
            !header.includes(CsvFields.proxyIp) ||
            !header.includes(CsvFields.proxyPort) ||
            !header.includes(CsvFields.proxyUserName) ||
            !header.includes(CsvFields.proxyPassword) ||
            !header.includes(CsvFields.proxyVersion) ||
            !header.includes(CsvFields.proxyCountry) ||
            !header.includes(CsvFields.proxyState) ||
            !header.includes(CsvFields.proxyCity)
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
                { id: 'machineName', title: CsvFields.description },
                { id: 'description', title: CsvFields.remark },
                { id: 'isActive', title: CsvFields.isActive },
                { id: 'realIp', title: CsvFields.ip },
                { id: 'clientOS', title: CsvFields.clientOS },
                { id: 'clientVersion', title: CsvFields.clientVersion },
                { id: 'clientMachineCode', title: CsvFields.clientMachineCode },
                { id: 'isDynamicalIp', title: CsvFields.isDynamicalIP },
                { id: 'ipCountry', title: CsvFields.ipCountry },
                { id: 'timeZone', title: CsvFields.timeZone },
                { id: 'gmt', title: CsvFields.gmt },
                { id: 'attribution', title: CsvFields.attribution },
                { id: 'language', title: CsvFields.language },
                { id: 'uaWindows', title: CsvFields.uaWidowns },
                { id: 'uaMac', title: CsvFields.uaMac },
                { id: 'uaLinux', title: CsvFields.uaLinux },
                { id: 'isCustomizedUA', title: CsvFields.isCustomizedUA },
                { id: 'isSyncCookieByUser', title: CsvFields.isSyncCookieByUser },
                { id: 'proxyType', title: CsvFields.proxyType },
                { id: 'proxyIp', title: CsvFields.proxyIp },
                { id: 'proxyPort', title: CsvFields.proxyPort },
                { id: 'proxyUserName', title: CsvFields.proxyUserName },
                { id: 'proxyPassword', title: CsvFields.proxyPassword },
                { id: 'proxyVersion', title: CsvFields.proxyVersion },
                { id: 'proxyCountry', title: CsvFields.proxyCountry },
                { id: 'proxyState', title: CsvFields.proxyState },
                { id: 'proxyCity', title: CsvFields.proxyCity },
            ],
        });
        let result = {};
        result['machineName'] = '[your client container description]';
        result['description'] = '[your remark]';
        result['realIp'] = '[real ip]';
        result['isActive'] = '[true|false]';
        result['clientOS'] = '[windows|...]';
        result['clientVersion'] = '[1.0.0|...]';
        result['clientMachineCode'] = '[f4:6b:8c:04:b3:ca]';
        result['isDynamicalIp'] = '[true|false]';
        result['ipCountry'] = '[Netherlands|...]';
        result['timeZone'] = '[Europe/Amsterdam|...]';
        result['gmt'] = '[GMT+2|...]';
        result['attribution'] = '[Zoetermeer, South Holland|...]';
        result['language'] = '[en-US|...]';
        result['uaWindows'] =
            '[Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.62 Safari/537.36|...]';
        result['uaMac'] = '[...]';
        result['uaLinux'] = '[...]';
        result['isCustomizedUA'] = '[true|false]';
        result['isSyncCookieByUser'] = '[true|false]';
        result['proxyType'] = '[http|https|socket5|...]';
        result['proxyIp'] = '[1.2.3.4|...]';
        result['proxyPort'] = '[8080|...]';
        result['proxyUserName'] = '[proxy user name]';
        result['proxyPassword'] = '[proxy password]';
        result['proxyVersion'] = '[1|...]';
        result['proxyCountry'] = '[null|...]';
        result['proxyState'] = '[null|...]';
        result['proxyCity'] = '[null|...]';

        const content = `${utf8BOM}${writer.getHeaderString()}${writer.stringifyRecords([result])}`;
        let fileName = `ClientContainer-Template-${moment().format('YYYYMMDD')}.csv`;
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
        let fileName = `ClientContainer-Errors-${moment().format('YYYYMMDD')}.txt`;
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
                title={Intl.formatMessage({ id: 'client.import.title' })}
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
