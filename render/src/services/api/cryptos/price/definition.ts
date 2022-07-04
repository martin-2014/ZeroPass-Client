export interface TokenPriceDetailItem {
    price: number | null;
    change24Hour: number | null;
    symbol: string;
    address: string;
    type: CryptoType;
}

type CryptoType = 'token' | 'blockchain';

export interface CoinGeckoPriceReqItem {
    symbol: string;
    cgId: string;
    address: string;
    type: CryptoType;
}

export interface CryptoComaprePriceReqItem {
    symbol: string;
    address: string;
    type: CryptoType;
}
