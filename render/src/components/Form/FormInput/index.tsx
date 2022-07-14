import message from '@/utils/message';
import { Input, InputProps, Tooltip } from 'antd';
import { cloneElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { FormItemContent } from '../FormItem';
import styles from './index.less';
import HubAlert from '@/components/HubAlert';
import classNames from 'classnames';
import { Copy } from '@icon-park/react';
import { memo } from 'react';

interface fieldButtion {
    icon: JSX.Element;
    onclick?: (e?: any) => void;
}

export type FormatResult = {
    formattedValue: string;
    separator?: string;
};
export interface Props extends InputProps {
    title?: string;
    children: JSX.Element;
    innerStyle?: React.HTMLAttributes<HTMLDivElement>['style'];
    wrapperStyle?: React.HTMLAttributes<HTMLDivElement>['style'];
    fieldButtions?: fieldButtion[];
    isEdit?: boolean;
    copyValue?: () => string;
    appId?: number;
    containerId?: string;
    isRequiredField?: boolean;
    formatter?: (preValue: string, currentValue: string) => FormatResult;
    label?: string | JSX.Element;
    suffixRender?: React.ReactNode;
}

const FormInput = (props: Props) => {
    const {
        title,
        wrapperStyle = {},
        children,
        isEdit,
        copyValue,
        innerStyle,
        onChange,
        onBlur,
        appId,
        containerId,
        isRequiredField = false,
        formatter,
        suffixRender,
        fieldButtions,
        ...otherProps
    } = props;
    const [validate, setValidate] = useState(true);
    const [focus, setFocus] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const value = useContext(FormItemContent);
    const canCopy = copyValue !== undefined;
    const inputRef = useRef<Input>();
    const [preValue, setPreValue] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [cursor, setCursor] = useState<number>(0);
    const [forceRender, setForceRender] = useState(false);
    const [msg, setMsg] = useState<JSX.Element | string>();
    useEffect(() => {
        value
            ?.then((res: any) => {
                if (res && res.status) {
                    setMsg(<HubAlert type={res.status} msg={res.help} />);
                } else {
                    setMsg('');
                }
                setValidate(true);
            })
            .catch((e) => {
                if (e && e.status) setMsg(<HubAlert type="error" msg={e.help} />);
                setValidate(false);
            });
    }, [value]);

    const findFirstDifference = (pre: string, changed: string) => {
        let i = 0;
        for (; pre[i] !== undefined && changed[i] !== undefined; i++) {
            if (pre[i] !== changed[i]) {
                return i;
            }
        }
        return i;
    };

    useEffect(() => {
        if (!(formatter && typeof inputRef.current?.setSelectionRange === 'function')) return;
        const { formattedValue, separator } = formatter(preValue, currentValue);

        let curPos = cursor;
        if (cursor === currentValue.length) {
            curPos = formattedValue.length;
        } else if (formattedValue.length == preValue.length) {
            if (formattedValue.length < currentValue.length) {
                curPos = findFirstDifference(currentValue, formattedValue);
            } else {
                curPos = cursor;
            }
        } else if (formattedValue.length > preValue.length) {
            curPos = formattedValue[cursor - 1] === separator ? cursor + 1 : cursor;
        } else {
            curPos = cursor;
        }
        inputRef.current?.setSelectionRange(curPos, curPos);
        setPreValue(formattedValue);
    }, [forceRender]);

    useEffect(() => {
        setValidate(true);
    }, [props]);

    const handleFocus = useCallback((e) => {
        const onFocus = children.props.onFocus;
        if (typeof onFocus === 'function') {
            onFocus();
        }
        setPreValue(e.target.value);
        setCursor(e.target.value?.length);
        setFocus(true);
    }, []);

    const handleBlur = useCallback((e) => {
        onBlur?.(e);
        const childOnBlur = children.props.onBlur;
        if (typeof childOnBlur === 'function') {
            childOnBlur(e);
        }
        setFocus(false);
    }, []);

    const handleChange = useCallback((e) => {
        onChange?.(e);
        if (e && e.target) {
            setCursor(e.target.selectionStart);
            setCurrentValue(e.target.value);
        } else {
            setCurrentValue(e);
        }
        setForceRender((pre) => !pre);
        const childrenOnChange = children.props.onChange;
        if (typeof childrenOnChange === 'function') {
            childrenOnChange(e);
        }
    }, []);

    const childrenProps = {
        onFocus: handleFocus,
        bordered: false,
        onBlur: handleBlur,
        onChange: handleChange,
    };

    const Children = cloneElement(
        children,
        { ...children.props, ...otherProps, ...childrenProps, ref: inputRef },
        children.props.children,
    );
    const Title = () => {
        return title || props.label ? (
            <div className={styles.label}>
                {props.label ?? <FormattedMessage id={title}></FormattedMessage>}
                {isRequiredField ? '*' : ''}
            </div>
        ) : (
            <></>
        );
    };

    if (wrapperStyle.display === 'none') {
        return <></>;
    }
    return (
        <div
            className={classNames(
                styles.inputWrapper,
                isEdit !== false ? styles.inputEditContainter : '',
            )}
            style={{
                position: 'relative',
                width: '100%',
                border: !validate ? '1px solid #ff4d4f' : focus ? '1px solid #2AA7FF' : '',
                ...wrapperStyle,
                backgroundColor: showModal
                    ? 'rgba(0, 0, 0, 0.05)'
                    : wrapperStyle['backgroundColor'],
                height: '100%',
            }}
        >
            <div
                className={`${styles.modal}`}
                onMouseEnter={() => setShowModal(true)}
                onMouseLeave={() => setShowModal(false)}
                style={{
                    display: isEdit !== false ? 'none' : 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                }}
            >
                <div
                    style={{
                        display: showModal ? '' : 'none',
                        paddingRight: 20,
                        height: '100%',
                        flexDirection: 'column',
                        borderRadius: wrapperStyle.borderRadius ?? 10,
                    }}
                >
                    <div style={{ marginTop: 5 }}>
                        <MemoButtons
                            fieldButtions={fieldButtions}
                            canCopy={canCopy}
                            copyCallback={copyValue}
                        />
                    </div>
                </div>
            </div>
            <div
                className={`${styles.inputContainter}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    ...innerStyle,
                }}
            >
                <div
                    style={{
                        height: innerStyle?.minHeight ? +innerStyle.minHeight * 0.25 + 5 : 24,
                        display:
                            props.title !== undefined ||
                            props.label !== undefined ||
                            props.suffixRender !== undefined
                                ? 'flex'
                                : 'none',
                        alignItems: 'center',
                    }}
                >
                    <Title></Title>
                    {suffixRender}
                    <div style={{ marginLeft: 20 }}>{msg}</div>
                </div>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {Children}
                </div>
            </div>
        </div>
    );
};

const Buttons = (props: {
    fieldButtions?: fieldButtion[];
    canCopy: boolean;
    copyCallback?: () => void;
}) => {
    const Intl = useIntl();

    let buttons: fieldButtion[] = [];
    if (props.canCopy) {
        buttons.push({
            icon: (
                <Tooltip title={Intl.formatMessage({ id: 'common.copy' })}>
                    <Copy className={'zp-icon'} size={18} />
                </Tooltip>
            ),
            onclick: () => {
                navigator.clipboard.writeText(props.copyCallback?.() ?? '');
                message.success(Intl.formatMessage({ id: 'common.copied' }));
            },
        });
    }
    buttons = props.fieldButtions ? [...buttons, ...props.fieldButtions] : buttons;
    return (
        <div style={{ display: 'flex' }}>
            {buttons.reverse().map((btn, index) => (
                <div
                    key={index}
                    style={{ cursor: 'pointer', marginLeft: 10 }}
                    onClick={() => btn.onclick?.()}
                >
                    {btn.icon}
                </div>
            ))}
        </div>
    );
};

export const MemoButtons = memo(Buttons, (pre, next) => {
    return pre.fieldButtions === next.fieldButtions;
});

export default FormInput;
