import { localStore } from '@/browserStore/store';
import message from '@/components/HubMessage';
import { getIntl } from 'umi';

export const base64ThumbImage = (file, maxWidth = 200, maxHeight = 100) => {
    try {
        const reader = new FileReader();
        const img = new Image();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        function testImg() {
            return new Promise((resolve, reject) => {
                img.onload = (m) => {
                    resolve(m);
                };
                img.onerror = (m) => {
                    reject(m);
                };
            });
        }

        const imgUrl = async () => {
            const test = await testImg();
            if (test.type === 'load') {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const originWidth = img.width;
                const originHeight = img.height;
                let targetWidth = originWidth;
                let targetHeight = originHeight;
                if (originWidth > maxWidth || originHeight > maxHeight) {
                    if (originWidth / originHeight > maxWidth / maxHeight) {
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                        targetHeight = maxHeight;
                        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                } else {
                    return img.currentSrc;
                }
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                context.fillStyle = '#fff';
                context.fillRect(0, 0, targetWidth, targetHeight);
                context.drawImage(img, 0, 0, targetWidth, targetHeight);
                const base64_url = canvas.toDataURL('image/jpeg', 1);
                return base64_url;
            }
            return '';
        };
        return imgUrl();
    } catch (e) {}
    return '';
};

export const filterData = function <T>(data: T[], properties: string[], value: string) {
    return data.filter((item) => {
        var values: string[] = [];
        Object.keys(item)
            .filter((c) => properties.includes(c))
            .forEach((c) =>
                Array.isArray(item[c]) ? (values = values.concat(item[c])) : values.push(item[c]),
            );
        return values.some((v) => v?.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) > -1);
    });
};

export const prependHttp = (url: string) => {
    const regWithSchema =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    const regWithoutSchema =
        /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

    if (url.match(regWithSchema)) {
        return url;
    } else if (url.match(regWithoutSchema)) {
        return `http://${url}`;
    } else {
        return url;
    }
};

export const getFaviconUrl = (url: string) => {
    try {
        const u = new URL(prependHttp(url));
        return `${u.origin}/favicon.ico`;
    } catch (e) {
        return 'defaultFavicon';
    }
};

export const IsPersonalItem = (id: number) => {
    return localStore.personalDomainId === id;
};

export const getUrlHost = (url: string) => {
    let result = '';
    try {
        const obj = new URL(url);
        result = obj.host;
    } catch {}
    return result;
};

interface IMatchLogin {
    uri: string;
    username: string;
}

export const matchLogin = (old: IMatchLogin, nnew: IMatchLogin) => {
    return (
        getUrlHost(old.uri) === getUrlHost(nnew.uri) &&
        old.username.toLowerCase() === nnew.username.toLowerCase()
    );
};

const openIpcBrowser = async (params: {
    uri: string;
    type?: Message.openDefaultBrowserType;
    browser?: Message.BrowserType;
}) => {
    if (!params.type) params.type = 'goto';
    const res = await window.electron.openApp(params);
    if (res !== 0) {
        message.error(getIntl().formatMessage({ id: 'common.browser.not.exist.tips' }));
    }
};

export const OpenUrlByBrowser = {
    default: (url: string, type?: Message.openDefaultBrowserType) => {
        openIpcBrowser({ uri: url, type: type });
    },
    chrome: (url: string, type?: Message.openDefaultBrowserType) => {
        openIpcBrowser({ uri: url, type: type, browser: 'chrome' });
    },
    edge: (url: string, type?: Message.openDefaultBrowserType) => {
        openIpcBrowser({ uri: url, type: type, browser: 'edge' });
    },
    firefox: (url: string, type?: Message.openDefaultBrowserType) => {
        openIpcBrowser({ uri: url, type: type, browser: 'firefox' });
    },
};

export const openHelp = () => {
    OpenUrlByBrowser.default('https://www.zpassapp.com/help/');
};

export const openServiceAggreement = () => {
    OpenUrlByBrowser.default('https://www.zpassapp.com/zero-password-app-user-service-agreement/');
};

export const openPrivacy = () => {
    OpenUrlByBrowser.default('https://www.zpassapp.com/zero-password-app-privacy-notice/');
};

export const promiseDelay = (ms: number) => {
    return new Promise((resove, _) => {
        setTimeout(resove, ms);
    });
};
