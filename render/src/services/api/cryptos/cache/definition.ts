export interface TokenInfoEntity {
    name: string;
    symbol: string;
    address: string;
    decimal: number;
}

export interface TokenTypeInfoEntity {
    block: number;
    tokens: TokenInfoEntity[];
}

export interface WalletTokenInfoEntity {
    id: string;
    address: string;
    chainId: string;
    erc20Tokens: TokenTypeInfoEntity;
    erc271Tokens: TokenTypeInfoEntity;
}

export interface CcPriceInfoEntity {
    id: string;
    address: string;
    platformType: 'token' | 'blockchain' | 'derivative';
    builtOn: string[];
    name: string;
    symbol: string;
    imageUrl: string;
}

export interface CoinGeckoTokenInfoEntity extends CcPriceInfoEntity {
    cgId: string;
}

export interface SyncInfo {
    when: number;
}

export interface IWalletStore {
    saveCcPriceInfos: (entities: CcPriceInfoEntity[]) => Promise<void>;
    getCcPriceInfos: (
        tokens: { symbol: string; address: string }[],
    ) => Promise<CcPriceInfoEntity[]>;
    saveCoinGeckoPiceInfos: (entities: CoinGeckoTokenInfoEntity[]) => Promise<void>;
    getCoinGeckoPriceInfos: (
        tokens: { symbol: string; address: string }[],
    ) => Promise<CoinGeckoTokenInfoEntity[]>;
    getLastSync: () => Promise<SyncInfo>;
    updateLastSync: () => Promise<void>;
}
