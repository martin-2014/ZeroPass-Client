import { localStore, secretKeyStore, sessionStore } from '@/browserStore/store';
import useInitData from '@/hooks/useInitData';
import ipcHandler, { syncItemListToPlugin } from '../../..//ipc/ipcHandler';
import { KeyStore, setKeyStore } from '@/models/keyStore';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { TEncryptionKey } from '@/secretKey/secretKey';
import { loginLocal } from '@/services/api/user';
import message from '@/utils/message';
import { Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { history, useIntl } from 'umi';

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const secretKey = useRef('');
    const [form] = Form.useForm();
    const intl = useIntl();
    const [submited, setSubmited] = useState(false);
    const { initDataWhenLogin, setCurrentUser } = useInitData();

    if (window.electron) {
        window.electron.logout();
        ipcHandler.startUp();
    }
    const setFileKey = (value: string) => {
        form.setFieldsValue({ fileKey: value });
    };

    const secretKeyInit = (user: string) => {
        const lastKey = secretKeyStore.getSecretKey(user);
        if (lastKey) {
            setFileKey(lastKey.substring(0, 8) + '**** **** ****');
            secretKey.current = lastKey;
        } else {
            setFileKey('');
            secretKey.current = '';
            setShowUpload(true);
        }
    };

    useEffect(() => {
        const lastUser = localStore.lastUser;
        if (lastUser) secretKeyInit(lastUser);
    }, []);

    const searchKey = () => {
        const email = form.getFieldValue('email');
        if (email) secretKeyInit(email);
    };

    const readFileText = async (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        function onFileLoad() {
            return new Promise((resolve, reject) => {
                reader.onload = (m) => {
                    resolve(m);
                };
                reader.onerror = (m) => {
                    reject(m);
                };
            });
        }
        const onLoad = await onFileLoad();
        if (onLoad.type == 'load') {
            return reader.result?.toString();
        }
        return '';
    };

    const fileChange = async (e: any) => {
        if ((e.path.length = 0)) {
            return;
        }
        const files = e.path[0].files;
        const file = files[0];
        const fileString = await readFileText(file);
        if (fileString) {
            setFileKey(fileString);
            secretKey.current = fileString;
        }
    };
    const IsEnterpriseOwner = (domains: API.domain[]): boolean => {
        for (const domain of domains) {
            if (domain.domainType == 2 && domain.isOwner === true) {
                return true;
            }
        }
        return false;
    };

    const login = async (values: API.Login) => {
        const secretKeyVaule = secretKey.current;
        const keyObj = new TEncryptionKey(values.email, values.password, secretKeyVaule);
        var cryptoService = new TCryptoService();
        const res = await cryptoService.login(values.email, values.password, secretKeyVaule);
        if (!res.fail) {
            let token = res.payload.token;
            sessionStore.token = token;
            secretKeyStore.setSecretKey(values.email, secretKeyVaule);
            await setKeyStore(new KeyStore(secretKeyVaule, 'enterprise', keyObj));
            const userInfo = await initDataWhenLogin(token);
            console.log('useInfo', userInfo);

            // Community edition not support enterprise owner account because it's meaningless after logging in.
            if (IsEnterpriseOwner(userInfo?.domains!)) {
                setCurrentUser(undefined);
                message.errorIntl('err.login.domainOwner', undefined, 10000);
                return false;
            }
            await loginLocal({ email: values.email, id: userInfo?.id! });
            if (userInfo) {
                await cryptoService.preCacheDataKey(true);
                history.push('/personal/menus/quickerfinder/favourites');
                return true;
            } else {
                return false;
            }
        } else {
            if (res.errorId == 'err_authentication_failed') {
                message.errorIntl('err.login.fail');
            } else {
                message.errorIntl(res.errorId);
            }
            return false;
        }
    };

    const handleSubmit = async (
        values: API.Login,
        login: (values: API.Login) => Promise<boolean>,
    ) => {
        setSubmited(true);
        const email = values.email;
        localStore.lastUser = email;
        localStore.rememberUser = true;

        let secretKeyVaule = secretKey.current;
        if (!secretKeyVaule) {
            setShowUpload(true);
            return;
        }

        setLoading(true);
        const result = await login(values);
        if (result) {
            if (window.electron) {
                window.electron.login();
                electron.sendUserLogin();
            }
            syncItemListToPlugin();
            message.success(intl.formatMessage({ id: 'login.success' }));
        } else {
            setShowUpload(true);
            setSubmited(false);
            setLoading(false);
        }
    };
    const createFileUpload = () => {
        const upload = document.createElement('input');
        upload.type = 'file';
        upload.onchange = (e) => fileChange(e);
        upload.click();
    };

    const createAcount = () => {
        history.push('/user/domain/register');
    };

    return {
        secretKey,
        loading,
        showUpload,
        setShowUpload,
        form,
        submited,
        intl,
        searchKey,
        login,
        handleSubmit,
        createFileUpload,
        createAcount,
    };
};

export default useLogin;
