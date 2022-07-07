import { useState } from 'react';
import { localStore } from '@/browserStore/store';
import { getLocale, setLocale, useModel } from 'umi';

export default () => {
    const [selectedLang, setSelectedLang] = useState(() => getLocale());
    const { lock, setLock } = useModel('autoLock');
    const { setLanguage } = useModel('timeAgo');

    function handleLanguageChange(value) {
        setLocale(value, false);
        if (window.electron) {
            electron.sendLocale(getLocale());
        }

        setSelectedLang(value);
        setLanguage(value);
    }

    function handleCloseAppChange(value: 1 | 2) {
        localStore.closeOption = value;
    }

    const hangeLockChange = (v: number) => {
        setLock(v);
    };

    return {
        selectedLang,
        lock,
        handleLanguageChange,
        handleCloseAppChange,
        hangeLockChange,
    };
};
