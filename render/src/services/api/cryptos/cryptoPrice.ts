import { ccPrice, geckoPrice } from './price';
import { CcPriceInfoEntity, CoinGeckoTokenInfoEntity, walletCache } from './cache';
import { CryptoPriceItem } from './definition';
import { CoinGeckoPriceReqItem, TokenPriceDetailItem } from './price/definition';
import { CacheValue, LruCache } from '../lruCache';

const OneHour = 60 * 60 * 1000;

const FiveMinutes = 5 * 60 * 1000;

interface PriceCacheValue extends CacheValue, TokenPriceDetailItem {}

const priceCache = new LruCache<PriceCacheValue>(FiveMinutes);

const syncCryptoCompareCoinInfo = async () => {
    const res = await ccPrice.getTokenInfos();
    if (res.Response != 'Success') {
        return;
    }
    const list: CcPriceInfoEntity[] = [];
    const data = res.Data;
    for (const key in data) {
        const item = data[key];
        const platformType = item.PlatformType;
        if (platformType != 'token') {
            continue;
        }
        const address = item.SmartContractAddress;
        const builtOn = item.BuiltOn?.split(',') ?? [];
        const name = item.CoinName ?? '';
        const imageUrl = item.ImageUrl ?? '';
        if (address === undefined) {
            continue;
        }
        const entity: CcPriceInfoEntity = {
            id: '',
            address: address,
            platformType: platformType,
            builtOn: builtOn,
            name: name,
            imageUrl: imageUrl,
            symbol: key,
        };
        list.push(entity);
    }
    await walletCache.saveCcPriceInfos(list);
};

interface CoinGeckoPriceItem {
    id: string;
    symbol: string;
    name: string;
    platforms: { [key: string]: string };
}

const hasPlatform = (item: CoinGeckoPriceItem, platform: string) => {
    return (
        item.platforms?.hasOwnProperty(platform) &&
        item.platforms[platform] !== undefined &&
        item.platforms[platform] !== ''
    );
};

const syncCoinGeckoCoinInfo = async () => {
    const res = await geckoPrice.getTokenInfos();
    if (!Array.isArray(res) || res.length == 0) {
        return;
    }
    const list: CoinGeckoTokenInfoEntity[] = [];
    const data = res as CoinGeckoPriceItem[];
    for (const item of data) {
        if (!hasPlatform(item, 'ethereum') && !hasPlatform(item, 'binance-smart-chain')) {
            continue;
        }
        const name = item.name;
        const cgId = item.id;
        const symbol = item.symbol;
        const etherAddress = item.platforms['ethereum'];
        const bnbAddress = item.platforms['binance-smart-chain'];
        if (etherAddress === bnbAddress) {
            const entity: CoinGeckoTokenInfoEntity = {
                id: '',
                name: name,
                cgId: cgId,
                symbol: symbol,
                address: etherAddress,
                builtOn: ['ETH', 'BNB'],
                imageUrl: '',
                platformType: 'token',
            };
            list.push(entity);
        } else {
            if (etherAddress !== undefined && etherAddress !== '') {
                const entity: CoinGeckoTokenInfoEntity = {
                    id: '',
                    name: name,
                    cgId: cgId,
                    symbol: symbol,
                    address: etherAddress,
                    builtOn: ['ETH'],
                    imageUrl: '',
                    platformType: 'token',
                };
                list.push(entity);
            }
            if (bnbAddress !== undefined && bnbAddress !== '') {
                const entity: CoinGeckoTokenInfoEntity = {
                    id: '',
                    name: name,
                    cgId: cgId,
                    symbol: symbol,
                    address: bnbAddress,
                    builtOn: ['BNB'],
                    imageUrl: '',
                    platformType: 'token',
                };
                list.push(entity);
            }
        }
    }
    await walletCache.saveCoinGeckoPiceInfos(list);
};

interface Addressable {
    address: string;
}

const excludes = <TAll extends Addressable, TExclude extends Addressable>(
    all: TAll[],
    exclude: TExclude[],
) => {
    return all.filter(
        (a) => !exclude.find((e) => e.address.toLowerCase() === a.address.toLowerCase()),
    );
};

const emptyPrices = (tokens: CryptoPriceItem[]) => {
    return tokens.map((t) => ({ ...t, id: t.address, price: null, change24Hour: null }));
};

const getCrytoPrice = async (tokens: CryptoPriceItem[]) => {
    const cachedPrices = priceCache.refresh();
    let noResultTokens = excludes(tokens, cachedPrices);
    const cgTokenInfos = await walletCache.getCoinGeckoPriceInfos(
        tokens.filter((i) => i.type === 'token'),
    );
    const symbols = cgTokenInfos.map((t) => {
        return { symbol: t.symbol, cgId: t.cgId, address: t.address, type: 'token' };
    });
    if (tokens.findIndex((t) => t.symbol.toLowerCase() == 'eth') >= 0) {
        symbols.push({ cgId: 'ethereum', symbol: 'eth', address: '', type: 'blockchain' });
    }
    if (tokens.findIndex((t) => t.symbol.toLowerCase() == 'bnb') >= 0) {
        symbols.push({ cgId: 'binancecoin', symbol: 'BNB', address: '', type: 'blockchain' });
    }
    const symbolsToGet = excludes(symbols, cachedPrices);
    if (symbolsToGet.length === 0) return cachedPrices;
    const res = await geckoPrice.getPriceInfos(symbolsToGet as CoinGeckoPriceReqItem[]);
    priceCache.update(res.map((r) => ({ ...r, id: r.address })));
    const lessTokens = excludes(
        tokens.filter((i) => i.type === 'token'),
        cgTokenInfos,
    );
    if (lessTokens.length === 0) {
        noResultTokens = excludes(noResultTokens, res);
        priceCache.update(emptyPrices(noResultTokens));
        return [...cachedPrices, ...res];
    }
    const ccTokenInfos = await walletCache.getCcPriceInfos(lessTokens);
    const res2 = await ccPrice.getPriceInfo(ccTokenInfos.map((t) => ({ ...t, type: 'token' })));
    priceCache.update(res2.map((r) => ({ ...r, id: r.address })));
    const allRes = [...res, ...res2];
    noResultTokens = excludes(noResultTokens, allRes);
    priceCache.update(emptyPrices(noResultTokens));
    return [...cachedPrices, ...allRes];
};

const priceRequester = {
    syncCoinInfo: async () => {
        const lastSync = await walletCache.getLastSync();
        if (Date.now() - lastSync.when < OneHour) return;
        await syncCoinGeckoCoinInfo();
        await syncCryptoCompareCoinInfo();
        await walletCache.updateLastSync();
    },
    getCrytoPrice: getCrytoPrice,
};

export { priceRequester };
