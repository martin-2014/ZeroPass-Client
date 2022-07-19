import Lock from '@/pages/Lock';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { sessionStore } from '@/browserStore/store';

let Timing = 0;
let LockInterval: NodeJS.Timer | undefined;

const AutoLock = () => {
    const [showLock, setShowLock] = useState(false);
    const { initialState } = useModel('@@initialState');
    const { lock } = useModel('autoLock');

    const startLock = () => {
        if (Timing >= lock) {
            setShowLock(true);
            updateExtensionUserProfile(true);
            Timing = 0;
            return;
        }
        Timing += 1;
        LockInterval = setTimeout(startLock, 1000);
    };

    const resetTiming = () => {
        Timing = 0;
    };

    const restartTiming = () => {
        setShowLock(false);
        updateExtensionUserProfile(false);
        startLock();
        Timing = 0;
    };

    const updateExtensionUserProfile = (isLocked: boolean) => {
        sessionStore.lock = isLocked.toString();
        initialState?.fetchUserInfo();
    };

    useEffect(() => {
        window.electron.extensionHeartbeat(resetTiming);

        window.addEventListener('click', resetTiming);
        window.addEventListener('mousemove', resetTiming);

        return () => {
            window.removeEventListener('click', resetTiming);
            window.removeEventListener('mousemove', resetTiming);
            if (LockInterval) {
                clearInterval(LockInterval);
                LockInterval = undefined;
                Timing = 0;
            }
        };
    }, []);

    useEffect(() => {
        if (LockInterval) {
            clearInterval(LockInterval);
            LockInterval = undefined;
        }

        if (lock !== 0) {
            startLock();
        }
    }, [lock]);

    return <Lock visible={showLock} callback={restartTiming} />;
};

export default AutoLock;
