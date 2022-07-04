import { useState } from 'react';

type BrowserStatusItem = {
    [k in string]: number;
};
const superBrowser = () => {
    const [superStatus, setSuperStatus] = useState<BrowserStatusItem>({});
    return { superStatus, setSuperStatus };
};

export default superBrowser;
