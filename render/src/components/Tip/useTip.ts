import { useEffect, useRef, useState } from 'react';
import { localStore, sessionStore } from '@/browserStore/store';

const Tips = ['tip.personal.1', 'tip.personal.2', 'tip.personal.3', 'tip.personal.4'];
const Images = ['./personal-1.png', './personal-2.png', './personal-3.png', './personal-4.png'];

const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            resolve(img);
        };
    });
};

export default () => {
    const [visible, setVisible] = useState(false);
    const checkRef = useRef(false);
    const [tips, setTips] = useState(Tips[0]);

    const handleSkip = () => {
        setVisible(false);
        localStore.skipUser = checkRef.current;
    };

    const getData = async () => {
        const loadImages = Images.map((src) => loadImage(src));
        await Promise.all(loadImages);
        setVisible(!localStore.skipUser);
    };
    useEffect(() => {
        if (!sessionStore.token || !sessionStore.token.length) return;
        getData();
    }, []);

    const beforeChange = (_: any, to: number) => {
        setTips(Tips[to]);
    };

    const tipsInfo = () => {
        return Images;
    };

    return {
        visible,
        tips,
        checkRef,
        handleSkip,
        getData,
        beforeChange,
        tipsInfo,
    };
};
