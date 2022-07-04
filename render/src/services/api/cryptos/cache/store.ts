import { IWalletStore, CcPriceInfoEntity, CoinGeckoTokenInfoEntity, SyncInfo } from './definition';
import { openDB } from 'idb';

interface Token {
    symbol: string;
    address: string;
}

const CcPriceTableName = 'cryptoCompareTokens';
const CoinGeckoTableName = 'coinGeckoTokens';
const SyncInfoTableName = 'sync';

const createPriceId = (symbol: string, address: string) => {
    return `${symbol.toLowerCase()}-${address?.toLowerCase()}`;
};

export const walletStore = async (): Promise<IWalletStore> => {
    const db = await openDB('walletStore', 4, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(CcPriceTableName)) {
                db.createObjectStore(CcPriceTableName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(CoinGeckoTableName)) {
                db.createObjectStore(CoinGeckoTableName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(SyncInfoTableName)) {
                db.createObjectStore(SyncInfoTableName, { keyPath: 'id' });
            }
        },
    });

    const get = async <T>(storeName: string, filter?: (val: T) => boolean) => {
        const store = db.transaction(storeName, 'readonly').objectStore(storeName);
        const all = (await store.getAll()) as T[];
        return filter ? all.filter(filter) : all;
    };

    const put = async <T>(storeName: string, values: T[] | T, id: (value: T) => string) => {
        const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
        const entities = Array.isArray(values) ? values : [values];
        for (let entity of entities) {
            await store.put({ ...entity, id: id(entity) });
        }
    };

    const store: IWalletStore = {
        saveCcPriceInfos: (entities: CcPriceInfoEntity[]) =>
            put(CcPriceTableName, entities, (entity) =>
                createPriceId(entity.symbol, entity.address),
            ),
        getCcPriceInfos: async (tokens: Token[]) => {
            const addrs = tokens.map((t) => t.address.toLowerCase());
            return await get<CcPriceInfoEntity>(CcPriceTableName, (v) =>
                addrs.includes(v.address.toLowerCase()),
            );
        },
        saveCoinGeckoPiceInfos: (entities: CoinGeckoTokenInfoEntity[]) =>
            put(CoinGeckoTableName, entities, (entity) =>
                createPriceId(entity.symbol, entity.address),
            ),
        getCoinGeckoPriceInfos: async (tokens: Token[]) => {
            const addrs = tokens.map((t) => t.address.toLowerCase());
            return await get<CoinGeckoTokenInfoEntity>(CoinGeckoTableName, (v) =>
                addrs.includes(v.address.toLowerCase()),
            );
        },
        getLastSync: async () => {
            const values = await get<SyncInfo>(SyncInfoTableName);
            return values[0] ?? { when: 0 };
        },
        updateLastSync: async () => {
            await put<SyncInfo>(SyncInfoTableName, { when: Date.now() }, () => 'Sync');
        },
    };

    return store;
};
