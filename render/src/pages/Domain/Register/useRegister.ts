import { getLocalTimeZone } from '@/hooks/useLocalTime';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { SecretKey } from '@/secretKey/cryptoService/SecretKey';
import {
    checkRegisterCode,
    register,
    RegisterItem,
    sendPersonalCode,
} from '@/services/api/register';
import message from '@/utils/message';
import owasp from 'owasp-password-strength-test';
import { ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState } from 'react';
import { history, useIntl } from 'umi';

const useRegister = (
    emailName: string,
    formMapRef: React.MutableRefObject<React.MutableRefObject<ProFormInstance<any> | undefined>[]>,
    current: number,
    setCurrent: React.Dispatch<React.SetStateAction<number>>,
) => {
    const intl = useIntl();
    const [passwordError, setPasswordError] = useState(true);
    const [passwordLevel, setPasswordLevel] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const registerDataRef = useRef<RegisterItem>();

    const getFormEmail = () => {
        return formMapRef.current[0].current?.getFieldValue(emailName);
    };
    const checkPasswordLevel = (e: React.ChangeEvent<HTMLInputElement>) => {
        let level = 0;
        try {
            const value = e.target.value;
            owasp.config({ minLength: 8, allowPassphrases: false });
            if (value) {
                const res = owasp.test(value);
                level = 100 - res.optionalTestErrors.length * 20;
                if (
                    res.requiredTestErrors.filter((item) => item.indexOf('characters long.') >= 0)
                        .length === 1
                ) {
                    level -= 40;
                }
                if (level === 80 && value.length >= 20) {
                    level = 100;
                }
            }
        } catch {}
        level = level < 20 ? 20 : level;
        setPasswordLevel(level);
    };

    const sendEmail = async () => {
        setLoading(true);
        let res;

        const values = formMapRef.current[0].current?.getFieldsValue();
        const params = { email: values[emailName] };

        params['timezone'] = getLocalTimeZone();
        params['accountType'] = values.accountType;
        res = await sendPersonalCode(params);
        setLoading(false);
        if (!res.fail) {
            setCurrent(1);
        } else {
            message.errorIntl(res.errorId);
        }
    };

    const resendEmail = () => {
        setShowResend(true);
        sendEmail();
        setTimeout(() => {
            setShowResend(false);
        }, 10 * 1000);
    };

    const checkCode = async () => {
        setLoading(true);
        const email = getFormEmail();
        const code = formMapRef.current[1].current?.getFieldValue('code');
        const res = await checkRegisterCode(email, code);
        setLoading(false);
        if (!res.fail && res.payload) {
            registerDataRef.current = res.payload;
            return true;
        } else {
            message.errorIntl(res.errorId);
            return false;
        }
    };
    const validatorPassword = (_: any, value: string, callback: (message?: string) => void) => {
        const values = formMapRef.current[current]?.current?.getFieldsValue();
        if (!value) {
            setPasswordError(true);
            callback(intl.formatMessage({ id: 'activate.reset.password.required' }));
        } else if (values.password != values.rePassword) {
            setPasswordError(true);
            callback(intl.formatMessage({ id: 'activate.same.password' }));
        } else {
            setPasswordError(false);
            callback();
        }
    };
    const onFinish = async () => {
        setLoading(true);
        const email = getFormEmail();
        const password = formMapRef.current[current].current?.getFieldValue('password');
        const secretKey = new SecretKey();
        const createKeyModel = await TCryptoService.createUserKeyModel(email, password, secretKey);
        if (registerDataRef.current) {
            registerDataRef.current.userKey = createKeyModel;
        } else {
            return false;
        }
        const res = await register(registerDataRef.current);
        if (!res.fail) {
            const secretKeyValue = secretKey.export();
            if (secretKeyValue) {
                history.push({
                    pathname: '/user/domain/register/result',
                    query: {
                        key: secretKeyValue,
                        pre: email.split('@')[0],
                    },
                });
                return true;
            } else {
                message.error(intl.formatMessage({ id: 'register.failed' }));
            }
        } else {
            message.errorIntl(res.errorId);
        }
        return false;
    };
    return {
        validatorPassword,
        registerDataRef,
        checkPasswordLevel,
        passwordLevel,
        passwordError,
        loading,
        resendEmail,
        checkCode,
        showResend,
        setShowResend,
        onFinish,
        sendEmail,
        current,
        setCurrent,
        getFormEmail,
        setLoading,
    };
};

export default useRegister;
