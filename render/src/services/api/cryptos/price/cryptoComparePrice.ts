import { cryptoCompareApiKeyPool } from '../apiKeyPool';
import { TokenPriceDetailItem, CryptoComaprePriceReqItem } from './definition';

const cryptoComparePrice = () => {
    const basePriceUrl = 'https://min-api.cryptocompare.com/data';

    const priceGet = async (url: string, params?: { [key: string]: any }) => {
        const reqUrl = `${url}?${new URLSearchParams({
            ...params,
            api_key: cryptoCompareApiKeyPool.getKey(),
        })}`;
        const promise = new Promise<any>(async (resolve) => {
            const startTime = new Date();
            const initialInterval = 3000;
            const timeout = 300000;
            const retryPromise = async (preInterval?: number) => {
                if (Date.now() - startTime.getTime() > timeout) {
                    return resolve({});
                }

                const res = await fetch(reqUrl, {
                    method: 'GET',
                });
                const data = await res.json();
                if (data.Response === 'Error') {
                    if (data.Message?.includes('over your rate limit')) {
                        setTimeout(retryPromise, preInterval ? preInterval * 2 : initialInterval);
                    } else {
                        resolve({});
                    }
                } else {
                    resolve(data);
                }
            };
            retryPromise();
        });
        return promise;
    };

    const getSubArray = (arr: any[], start: number, length: number) => {
        return arr.slice(start, start + length);
    };

    const getSymbols = (arr: any[], start: number, maxLen: number): [string, number] => {
        const size = 50;
        let temp: string[] = [];
        let fsyms = '';
        for (let i = size; i > 0; i--) {
            temp = getSubArray(arr, start, i);
            fsyms = temp.join(',');
            if (fsyms.length < maxLen) {
                start += temp.length;
                break;
            }
        }
        return [fsyms, start];
    };

    const getMultiPriceInfo = async (symbols: CryptoComaprePriceReqItem[]) => {
        const result: TokenPriceDetailItem[] = [];
        if (symbols.length === 0) return result;
        let start = 0;
        const symbolStrs = symbols.map((s) => s.symbol);
        while (true) {
            let [fsyms, next] = getSymbols(symbolStrs, start, 1000);
            start = next;
            if (fsyms.length === 0) {
                break;
            }
            const params = {
                fsyms: fsyms,
                tsyms: 'USD',
            };
            const res = await priceGet(`${basePriceUrl}/pricemultifull`, params);
            if (res.Response == 'Error') {
                break;
            }
            const raw = res['RAW'];
            for (const key in raw) {
                const price = raw[key]['USD']['PRICE'];
                const changed = raw[key]['USD']['CHANGE24HOUR'];

                const symbol = symbols.find((s) => s.symbol.toLowerCase() === key.toLowerCase());
                if (symbol !== undefined) {
                    const item: TokenPriceDetailItem = {
                        price: price,
                        change24Hour: changed ? (changed / (price - changed)) * 100 : null,
                        symbol: key.toUpperCase(),
                        address: symbol.address,
                        type: symbol.type,
                    };
                    result.push(item);
                }
            }
        }
        return result;
    };

    return {
        getTokenInfos: async () => {
            return await priceGet(`${basePriceUrl}/all/coinlist`);
        },
        getPriceInfo: async (symbols: CryptoComaprePriceReqItem[]) => {
            return await getMultiPriceInfo(symbols);
        },
    };
};

export { cryptoComparePrice };
