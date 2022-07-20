import { useState } from 'react';

export default () => {
    const [refreshLoginList, setRefreshLoginList] = useState(false);
    return {
        refreshLoginList,
        setRefreshLoginList,
    };
};
