interface DataValue {
    [key: string]: number;
}

interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimal: number;
}

interface CryptoPriceItem {
    symbol: string;
    address: string;
    type: 'token' | 'blockchain';
}

const PRICE_DECIMAL = 10;

export { DataValue, TokenInfo, CryptoPriceItem, PRICE_DECIMAL };
