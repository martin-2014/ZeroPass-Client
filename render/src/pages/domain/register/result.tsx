import type { FC } from 'react';
import { FormattedMessage, history, useIntl } from 'umi';
import { Col, Row, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { downloadSecretKey } from '@/utils/secretKeyDownloader';
import message from '@/utils/message';
import HubButton from '@/components/HubButton';
import { CheckCircleOutlined } from '@ant-design/icons';
import BaseLayout from './baseLayout';

const { confirm } = Modal;

interface PropItems {
    close?: () => void;
    params?: any;
}

const ActivateResult: FC<PropItems> = (props) => {
    const [downloadStatus, setDownloadStatus] = useState(false);
    const Intl = useIntl();

    const downloadKey = () => {
        try {
            const key = history.location.query?.key;
            const pre = history.location.query?.pre;
            downloadSecretKey(pre, key);
            setDownloadStatus(true);
        } catch (e) {}
    };

    const close = () => {
        if (!downloadStatus) {
            confirm({
                title: Intl.formatMessage({ id: 'activate.result.tips' }),
                icon: <ExclamationCircleOutlined />,
                okCancel: false,
            });
        } else {
            if (props.close) {
                props.close();
            } else {
                history.push({
                    pathname: '/user/login',
                });
            }
        }
    };

    const copyKey = (e) => {
        navigator.clipboard.writeText(e.target.innerText);
        setDownloadStatus(true);
        message.success(Intl.formatMessage({ id: 'activate.copy.success' }));
    };

    return (
        <BaseLayout header={<FormattedMessage id="activate.result.title" />}>
            <div style={{ margin: 'auto', height: 500, width: 820 }}>
                <Row style={{ marginBottom: '20px' }}>
                    <Col span="3">
                        <CheckCircleOutlined
                            style={{
                                fontSize: '70px',
                                color: '#009AFF',
                                width: 100,
                            }}
                        />
                    </Col>
                    <Col span="21" style={{ fontSize: '22px', margin: '15px 0 30px 0' }}>
                        <FormattedMessage id="activate.result.content" />
                    </Col>
                </Row>
                <div
                    style={{
                        marginBottom: 15,
                        fontSize: '20px',
                        fontWeight: 600,
                        textAlign: 'center',
                    }}
                >
                    <FormattedMessage id="activate.result.message.copy" />
                </div>
                <Row>
                    <HubButton
                        type={'default'}
                        onClick={copyKey}
                        width={628}
                        style={{ margin: 'auto' }}
                        height={40}
                    >
                        {history.location.query?.key}
                    </HubButton>
                </Row>
                <div
                    style={{
                        marginTop: 30,
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: 15,
                        textAlign: 'center',
                    }}
                >
                    <FormattedMessage id="activate.result.message.download" />
                </div>
                <Row>
                    <HubButton
                        type={'primary'}
                        width={628}
                        style={{ margin: 'auto' }}
                        height={40}
                        onClick={downloadKey}
                    >
                        {Intl.formatMessage({ id: 'activate.result.download' })}
                    </HubButton>
                </Row>
                <Row
                    style={{
                        marginTop: 60,
                    }}
                >
                    <HubButton
                        type={'primary'}
                        width={120}
                        style={{ margin: 'auto' }}
                        height={40}
                        onClick={close}
                    >
                        {Intl.formatMessage({ id: 'common.finish' })}
                    </HubButton>
                </Row>
            </div>
        </BaseLayout>
    );
};

export default ActivateResult;
