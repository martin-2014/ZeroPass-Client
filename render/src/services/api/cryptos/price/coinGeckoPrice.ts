import { CoinGeckoPriceReqItem, TokenPriceDetailItem } from './definition';

const coinGeckoPrice = () => {
    const basePriceUrl = 'https://api.coingecko.com/api/v3';

    const priceGet = async (url: string, params?: { [key: string]: any }) => {
        let reqUrl = url;
        if (params != undefined) {
            reqUrl = `${url}?${new URLSearchParams(params)}`;
        }
        const promise = new Promise<any>(async (resolve) => {
            const startTime = new Date();
            const initialInterval = 3000;
            const timeout = 300000;
            const retryPromise = async (preInterval?: number) => {
                if (Date.now() - startTime.getTime() > timeout) {
                    return resolve({});
                }
                try {
                    const res = await fetch(reqUrl, {
                        method: 'GET',
                    });
                    if (res.status === 200) {
                        const data = await res.json();
                        resolve(data);
                    } else if (res.status === 429) {
                        //rate limit
                        setTimeout(retryPromise, preInterval ? preInterval * 2 : initialInterval);
                    } else {
                        resolve({});
                    }
                } catch (err) {
                    console.log(`fetch price from "${reqUrl}" error: `, err);
                    resolve({});
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
        const size = 500;
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

    const getCoinPrice = async (symbols: CoinGeckoPriceReqItem[]) => {
        const result: TokenPriceDetailItem[] = [];
        if (symbols.length === 0) return result;
        let start = 0;
        let allIds = symbols.map((s) => s.cgId);
        while (true) {
            let [ids, next] = getSymbols(allIds, start, 3000);
            start = next;
            if (ids.length === 0) {
                break;
            }
            const params = {
                ids: ids,
                vs_currencies: 'usd',
                include_24hr_change: true,
            };
            const res = await priceGet(`${basePriceUrl}/simple/price`, params);
            for (const id in res) {
                const symbol = Object.values(symbols).find((s) => s.cgId == id);
                if (symbol !== undefined) {
                    const item: TokenPriceDetailItem = {
                        price: res[id]['usd'] || null,
                        change24Hour: res[id]['usd_24h_change'] || null,
                        symbol: symbol.symbol.toUpperCase(),
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
            return await priceGet(`${basePriceUrl}/coins/list`, { include_platform: true });
        },
        getPriceInfos: async (symbols: CoinGeckoPriceReqItem[]) => {
            return await getCoinPrice(symbols);
        },
    };
};

export { coinGeckoPrice };
