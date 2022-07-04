import { cryptoUntity } from './unitity/cryptoUntity';

let g_cacheSecureKey: CryptoKey | undefined;

const SafeCacheProxy = {
    getCryptoKey: async () => {
        const cryptoCacheKey = '%~# %$^';
        if (g_cacheSecureKey !== undefined) return g_cacheSecureKey;
        let exportedKey = electron.safeCache.getItem(cryptoCacheKey);
        if (exportedKey.length > 0) {
            g_cacheSecureKey = await cryptoUntity.AES.importKey(exportedKey);
            return g_cacheSecureKey;
        }
        g_cacheSecureKey = await cryptoUntity.AES.generateKeyObject();
        electron.safeCache.setItem(
            cryptoCacheKey,
            await cryptoUntity.AES.exportKey(g_cacheSecureKey),
        );
        return g_cacheSecureKey;
    },

    setItem: async (key: string, value: string) => {
        if (!window.electron) return false;
        const cryptoKey = await SafeCacheProxy.getCryptoKey();
        const encryptedValue = await cryptoUntity.AES.encryptText(value, cryptoKey);
        electron.safeCache.setItem(key, encryptedValue);
        return true;
    },

    getItem: async (key: string) => {
        if (!window.electron) return '';
        const cryptoKey = await SafeCacheProxy.getCryptoKey();
        const encryptedValue = electron.safeCache.getItem(key);
        const value =
            encryptedValue.length > 0
                ? await cryptoUntity.AES.decryptText(encryptedValue, cryptoKey)
                : encryptedValue;
        return value;
    },

    clearAll: () => {
        g_cacheSecureKey = undefined;
        console.log('clearAll - enter ');
        if (window.electron) electron.safeCache.clear();
    },
};

export default SafeCacheProxy;
