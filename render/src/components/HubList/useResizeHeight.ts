import { useEffect, useState } from 'react';

const getTableHeight = () => {
    return document.body.clientHeight - 330;
};

export default () => {
    const [height, setHeight] = useState(getTableHeight());

    useEffect(() => {
        const changeHeight = () => {
            setHeight(getTableHeight());
        };
        window.addEventListener('resize', changeHeight);
        return () => {
            window.removeEventListener('resize', changeHeight);
        };
    }, []);

    return {
        height,
    };
};
