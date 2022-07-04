import { useEffect, useState } from 'react';
import { localStore } from '@/browserStore/store';

export type ThemeType = 'light' | 'dark';

export default () => {
    const [theme, updateTheme] = useState<ThemeType>('dark');

    const setTheme = (v: ThemeType) => {
        localStore.theme = v;
        updateTheme(v);
    };

    useEffect(() => {
        const initTheme: ThemeType = localStore.theme;
        updateTheme(initTheme);
    }, []);
    return { theme, setTheme };
};
