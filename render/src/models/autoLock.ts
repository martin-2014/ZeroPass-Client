import { useEffect, useState } from 'react';
import { localStore } from '@/browserStore/store';

export default () => {
    const [lock, updateLock] = useState<number>(0);

    const setLock = (v: number) => {
        localStore.lock = v;
        updateLock(v);
    };

    useEffect(() => {
        const initLock: number = localStore.lock;
        updateLock(initLock ?? 0);
    }, []);

    return { lock, setLock };
};
