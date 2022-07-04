import { Menu, Dropdown, Button, Space, Typography } from 'antd';
import { useState, useEffect } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';

type ValueType = string | number;
type TypeType = 'red' | 'blue' | 'orange';
export type OptionType = { value: ValueType; label: string; type?: TypeType };

type props = {
    defaultValue?: ValueType;
    value?: ValueType;
    disable?: boolean;
    onChange?: (item: OptionType) => void;
    container?: HTMLElement;
    options?: OptionType[];
    type?: TypeType;
    theme?: 'outline' | 'fill';
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
};

const { Text } = Typography;
const DefaultWidth = 90;

const HubOption = (props: props) => {
    const [selected, setSelected] = useState<OptionType | undefined>(
        getItemByValue(props.defaultValue),
    );
    const Intl = useIntl();

    function getItemByValue(v?: ValueType) {
        if (props.options) {
            for (const op of props.options) {
                if (op.value == v) {
                    return op;
                }
            }
        }
        return undefined;
    }

    useEffect(() => {
        if (props.value !== undefined) setSelected(getItemByValue(props.value));
    }, [props.value]);

    const handleMenuClick = function (e: any) {
        e.domEvent.stopPropagation();
        const v = e.key;
        const item = getItemByValue(v);
        if (item) {
            setSelected(item);
            if (props.onChange) props.onChange(item);
        }
    };

    const menu = (
        <Menu
            onClick={handleMenuClick}
            style={{
                width: props.style?.width ?? DefaultWidth,
                padding: '0',
            }}
        >
            {props.options?.map((item) => {
                if (item.value !== selected?.value) {
                    return (
                        <Menu.Item
                            style={{
                                fontSize: props.style?.fontSize ?? '13px',
                            }}
                            key={item.value}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                <Text
                                    style={{
                                        width: props.style?.width
                                            ? +props.style?.width - 20
                                            : DefaultWidth - 20,
                                    }}
                                    ellipsis={{ tooltip: Intl.formatMessage({ id: item.label }) }}
                                >
                                    {Intl.formatMessage({ id: item.label })}
                                </Text>
                            </div>
                        </Menu.Item>
                    );
                }
                return;
            })}
        </Menu>
    );

    const getColor = (type?: TypeType) => {
        switch (type) {
            case 'red':
                return '#FF6A6A';

            case 'orange':
                return '#FFBB44';
            default:
                return '#58C1FD';
        }
    };

    return (
        <div>
            <Dropdown
                overlay={props.disable ? <></> : menu}
                trigger={['click']}
                getPopupContainer={() => {
                    return props.container ?? document.body;
                }}
            >
                <Button
                    size="small"
                    style={{
                        width: DefaultWidth,
                        fontSize: props.style?.fontSize ?? '13px',
                        borderRadius: 4,
                        color: props.theme === 'fill' ? 'white' : getColor(selected?.type),
                        backgroundColor:
                            props.theme === 'fill' ? getColor(selected?.type) : 'unset',
                        border:
                            props.theme === 'fill'
                                ? 'unset'
                                : `1px solid ${getColor(selected?.type)}`,
                        cursor: 'unset',
                        padding: '0 2px',
                        ...props.style,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={props.disable}
                >
                    <div style={{ display: 'flex', height: '100%' }}>
                        <div
                            style={{
                                flex: 1,
                                overflow: 'hidden',
                                height: '100%',
                                alignItems: 'center',
                                display: 'flex',
                                textAlign: 'center',
                            }}
                        >
                            <Text
                                style={{ width: '100%' }}
                                ellipsis={{
                                    tooltip: selected
                                        ? Intl.formatMessage({ id: selected.label })
                                        : '',
                                }}
                            >
                                {selected ? Intl.formatMessage({ id: selected.label }) : ''}
                            </Text>
                        </div>
                        <div
                            style={{
                                paddingRight: 3,
                                width: 13,
                                display: props.disable ? 'none' : 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <DownOutlined
                                style={{
                                    fontSize: 10,
                                    color:
                                        props.theme == 'fill' ? 'white' : getColor(selected?.type),
                                }}
                            />
                        </div>
                    </div>
                </Button>
            </Dropdown>
        </div>
    );
};

export default HubOption;
