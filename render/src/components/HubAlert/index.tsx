import { ValidateStatus } from 'antd/lib/form/FormItem';
import { ExclamationCircleFilled, CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';

interface PropsItem {
    type?: ValidateStatus;
    fontSize?: number;
    iconSize?: number;
    msg: string | JSX.Element;
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
}

interface InfoItem {
    icon: JSX.Element;
    msg: string | JSX.Element;
    color: string;
}

const HubAlert = (props: PropsItem) => {
    const [info, setInfo] = useState<InfoItem>();

    useEffect(() => {
        let color = '#4342ff';
        let style = {
            fontSize: props.iconSize
                ? props.iconSize
                : props.fontSize
                ? `${props.fontSize}px`
                : '14px',
            color: color,
        };
        let icon: JSX.Element = <ExclamationCircleFilled style={style} />;

        switch (props.type) {
            case 'error':
                style.color = '#ff4d4f';
                color = '#ff4d4f';
                icon = <ExclamationCircleFilled style={style} />;
                break;
            case 'success':
                style.color = '#52c41a';
                color = '#52c41a';
                icon = <CheckCircleFilled style={style} />;
                break;
            case 'warning':
                icon = <ExclamationCircleFilled style={style} />;
                break;
            case 'validating':
                style = {
                    fontSize: props.fontSize ? `${props.fontSize - 2}px` : '12px',
                    color: color,
                };
                icon = (
                    <Spin
                        style={{ marginTop: -4 }}
                        indicator={<LoadingOutlined style={style} />}
                    ></Spin>
                );
        }
        setInfo({ icon: icon, msg: props.msg, color: color });
    }, [props.type, props.msg]);

    return (
        <div style={{ display: 'flex', ...props.style }}>
            <div style={{ marginRight: 5, lineHeight: '22px' }}>{info?.icon}</div>
            <div
                style={{
                    color:
                        props.type === 'warning' || props.type === undefined
                            ? '#6e6e6e'
                            : info?.color,
                    fontSize: props.fontSize ?? 12,
                    display: 'flex',
                    flexDirection: 'column',
                    lineHeight: '22px',
                }}
            >
                {info?.msg}
            </div>
        </div>
    );
};

export default HubAlert;
