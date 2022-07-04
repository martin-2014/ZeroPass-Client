import { address } from './address';
import { etherApi } from './chains';
import { walletCache } from './cache';
import { priceRequester } from './cryptoPrice';
import { PRICE_DECIMAL } from './definition';
import type { CryptoPriceItem as ICryptoPriceItem } from './definition';
import { iconMap } from './iconMap';

type CryptoPriceItem = ICryptoPriceItem;

const getTokenIcon = (address: string) => {
    if (iconMap.hasOwnProperty(address)) {
        const addr = iconMap[address];
        if (addr) return `https://assets.coingecko.com/coins/images/${addr}`;
    }
    return undefined;
};

export {
    priceRequester,
    address,
    etherApi,
    walletCache,
    PRICE_DECIMAL,
    CryptoPriceItem,
    getTokenIcon,
};
