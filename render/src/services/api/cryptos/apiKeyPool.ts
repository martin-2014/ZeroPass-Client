import { ethApiKey, bscApiKey, cryptocompareApiKey } from '@/.hub/config';

function* infinitLoop<T>(arr: T[]) {
    let index = 0;
    while (true) {
        if (!arr[index]) {
            index = 0;
        }
        yield arr[index++];
    }
}

const createPool = (keys: string[]): KeyPool => {
    const pool = infinitLoop(keys);
    return {
        getKey: () => pool.next().value || '',
        size: keys.length, // keys.length / 2
    };
};

export interface KeyPool {
    getKey: () => string;
    size: number;
}

export const ethApiKeyPool = createPool(ethApiKey.split(','));
export const bscApiKeyPool = createPool(bscApiKey.split(','));
export const cryptoCompareApiKeyPool = createPool(cryptocompareApiKey.split(','));
