import { localStore } from '@/browserStore/store';
import message from '@/components/HubMessage';
import { getIntl } from 'umi';

export const base64ThumbImage = (file, maxWidth = 200, maxHeight = 100) => {
    try {
        // 压缩图片需要的一些元素和对象
        const reader = new FileReader();
        //创建一个img对象
        const img = new Image();
        reader.readAsDataURL(file.originFileObj);
        // 文件base64化，以便获知图片原始尺寸
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

        // 等待图片加载完成
        const imgUrl = async () => {
            const test = await testImg();
            if (test.type === 'load') {
                // 缩放图片需要的canvas（也可以在DOM中直接定义canvas标签，这样就能把压缩完的图片不转base64也能直接显示出来）
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                // 图片原始尺寸
                const originWidth = img.width;
                const originHeight = img.height;
                // 目标尺寸
                let targetWidth = originWidth;
                let targetHeight = originHeight;
                // 图片尺寸超过最大值的限制
                if (originWidth > maxWidth || originHeight > maxHeight) {
                    if (originWidth / originHeight > maxWidth / maxHeight) {
                        // 更宽，按照宽度限定尺寸
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                        targetHeight = maxHeight;
                        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                } else {
                    return img.currentSrc;
                }
                // canvas对图片进行缩放
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                context.fillStyle = '#fff';
                context.fillRect(0, 0, targetWidth, targetHeight);
                // 清除画布
                // context.clearRect(0, 0, targetWidth, targetHeight);
                // 图片压缩
                /*第一个参数是创建的img对象；第二三个参数是左上角坐标，后面两个是画布区域宽高*/
                context.drawImage(img, 0, 0, targetWidth, targetHeight);
                //压缩后的图片转base64 url
                //canvas.toDataURL(mimeType, qualityArgument),mimeType 默认值是'image/png';
                //qualityArgument表示导出的图片质量，只有导出为jpeg和webp格式的时候此参数才有效，默认值是0.92
                const base64_url = canvas.toDataURL('image/jpeg', 1); //base64 格式
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

export const openUrlByDefaultBrowser = (url: string) => {
    window.electron.openApp({ uri: url, type: 'goto' });
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
