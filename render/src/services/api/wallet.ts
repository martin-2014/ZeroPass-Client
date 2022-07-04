import { mnemonicToSeed } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import { BigNumber, ethers, FixedNumber } from 'ethers';
import { address as apiAddress, CryptoPriceItem, etherApi, priceRequester } from './cryptos';
import { BalanceMap } from 'eth-balance-checker/lib/common';
import { onceExecutor } from './requester';
import { sumValues } from '@/utils/fixedNumber';
import { walletConfigs } from './walletConfigs';

const hdPathString = "m/44'/60'/0'/0";

const executor = onceExecutor();

const isValidAddress = (address: string) => {
    try {
        ethers.utils.getAddress(address);
        return true;
    } catch {
        return false;
    }
};

// https://danfinlay.github.io/mnemonic-account-generator/
export const generateEtherAccounts = async (mnemonic: string, count: number, start: number = 0) => {
    const real = mnemonic.trim().replaceAll(/\s+/g, ' ');
    const seed = await mnemonicToSeed(real);
    const hdWallet = hdkey.fromMasterSeed(seed);
    const root = hdWallet.derivePath(hdPathString);
    const wallets = [];
    for (let i = 0; i < count; i++) {
        const child = root.deriveChild(start + i);
        const wallet = child.getWallet();
        wallets.push(wallet);
    }
    const hexWallets = wallets.map((w, i) => {
        const index = start + i;
        return {
            index,
            address: `0x${w.getAddress().toString('hex')}`,
            privateKey: w.getPrivateKeyString(),
        };
    });
    return hexWallets;
};

type TokenType = 'ERC20' | 'ECR721';

type TokenValue = {
    balance: string;
    decimal: number;
    price: number | null;
};

export type TokenBasic = {
    name: string;
    symbol: string;
    type: TokenType;
    contract: string;
};

export type TokenDetail = TokenBasic &
    TokenValue & {
        change24Hour: number | null;
    };

export type WalletAccount = {
    address: string;
    network: MetaMask.Network;
    balance: FixedNumber | null;
    price: FixedNumber | null;
    value: FixedNumber | null;
    tokenValue: FixedNumber | null;
    tokens: TokenDetailItem[] | null;
};

export type TokenDetailItem = TokenBasic & {
    balance: FixedNumber;
    price: FixedNumber | null;
    value: FixedNumber | null;
    changed24Hour: FixedNumber | null;
};

const toFixedNumber = (val: any) => {
    try {
        if (val === null || isNaN(val)) return null;
        const str = Number(val).toFixed(18).toString();
        if (!str.includes('e')) return FixedNumber.from(str);
        const exponent = Number(str.split('e')[1]);
        if (exponent > 0) return FixedNumber.from(str);
        return FixedNumber.from(val.toFixed(-exponent));
    } catch (err) {
        console.log('failed to convert to fixed number: ', val);
        return null;
    }
};

const OneHundred = FixedNumber.from(100);

const getWalletTokens = async (
    address: string,
    network: MetaMask.Network,
    isCanceled: () => boolean,
): Promise<TokenDetailItem[]> => {
    const tokenDetails: TokenDetailItem[] = [];
    const configs = walletConfigs.value;
    const api = configs[network];
    const symbol = configs[network].symbol;
    const scanApi = apiAddress(api.api, api.chainId);
    const tokens = await scanApi.getTokens(address);
    if (isCanceled()) return tokenDetails;
    const nfts = await scanApi.getNfts(address);
    if (isCanceled()) return tokenDetails;
    const allTokens = [...Object.values(tokens), ...Object.values(nfts)];
    let tokenBalance = await scanApi.getTokenBalance(address, allTokens);

    if (isCanceled()) return tokenDetails;
    const zeroBalance: BalanceMap = {};
    for (const key in tokenBalance) {
        if (tokenBalance[key] === '0') {
            zeroBalance[key] = tokenBalance[key].toString();
        }
    }
    if (Object.keys(zeroBalance).length > 0) {
        // retry to get zero balance tokens
        const zeroAddrs = Object.keys(zeroBalance);
        const nextBalance = await scanApi.getTokenBalance(
            address,
            allTokens.filter((t) => zeroAddrs.includes(t.address)),
        );
        tokenBalance = { ...tokenBalance, ...nextBalance };
    }

    if (isCanceled()) return tokenDetails;
    const tokenSymbols: CryptoPriceItem[] = Object.values(tokens).map((v) => {
        return { symbol: v.symbol, address: v.address, type: 'token' };
    });
    tokenSymbols.push({ symbol: symbol, type: 'blockchain', address: '' });
    const prices = await priceRequester.getCrytoPrice(tokenSymbols);
    if (isCanceled()) return tokenDetails;
    for (const token of Object.values(tokens)) {
        const tokenPrice = prices.find(
            (p) => p.address.toLowerCase() == token.address.toLowerCase(),
        ) || { price: null, change24Hour: null };
        const balance = FixedNumber.from(
            ethers.utils.formatUnits(tokenBalance[token.address], token.decimal),
        );
        const price = tokenPrice.price === null ? null : toFixedNumber(tokenPrice.price);
        const value = price === null ? null : balance.mulUnsafe(price);
        const changed24Hour =
            tokenPrice.change24Hour === null
                ? null
                : toFixedNumber(tokenPrice.change24Hour)?.divUnsafe(OneHundred) || null;
        const detail: TokenDetailItem = {
            name: token.name,
            symbol: token.symbol,
            type: 'ERC20',
            contract: token.address,
            balance: balance,
            price: price,
            value: value,
            changed24Hour: changed24Hour,
        };
        tokenDetails.push(detail);
    }
    for (const nft of Object.values(nfts)) {
        tokenDetails.push({
            name: nft.name,
            symbol: nft.symbol,
            type: 'ECR721',
            contract: nft.address,
            price: null,
            changed24Hour: null,
            value: null,
            balance: FixedNumber.from(ethers.utils.formatUnits(tokenBalance[nft.address], 0)),
        });
    }
    return tokenDetails;
};

const getCoinPrice = async (symbol: string) => {
    const prices = await priceRequester.getCrytoPrice([
        {
            symbol: symbol,
            type: 'blockchain',
            address: '',
        },
    ]);
    return (
        prices.find((p) => p.symbol.toLowerCase() == symbol.toLowerCase() && p.type == 'blockchain')
            ?.price || null
    );
};

const getWalletAccounts = async (
    coinAddress: string[],
    network: MetaMask.Network,
    isCanceled: () => boolean,
): Promise<WalletAccount[]> => {
    const result: WalletAccount[] = [];
    const configs = walletConfigs.value;
    const api = configs[network];
    const symbol = configs[network].symbol;
    const scanApi = apiAddress(api.api, api.chainId);
    if (isCanceled()) return result;
    const coinBalance = await scanApi.getAddressBalance(
        coinAddress.filter((c) => isValidAddress(c)),
    );
    const coinPrice = await getCoinPrice(symbol);
    for (const addr of Object.keys(coinBalance)) {
        if (isCanceled()) break;
        const balance = FixedNumber.from(
            ethers.utils.formatUnits(BigNumber.from(coinBalance[addr] ?? 0).toString(), 18),
        );
        const price = toFixedNumber(coinPrice);
        const value = price === null ? null : price.mulUnsafe(balance);
        result.push({
            network,
            address: addr,
            balance: balance,
            price: price,
            value,
            tokens: null,
            tokenValue: null,
        });
    }
    const invalidAddress = coinAddress.filter((a) => !isValidAddress(a));
    for (const addr of invalidAddress) {
        result.push({
            network,
            address: addr,
            balance: null,
            price: null,
            value: null,
            tokens: null,
            tokenValue: null,
        });
    }
    return result;
};

const getWalletAccountsAndTokens = async (
    coinAddress: string[],
    network: MetaMask.Network,
    isCanceled: () => boolean,
): Promise<WalletAccount[] & { skip?: boolean }> => {
    const configs = walletConfigs.value;
    const accounts = await getWalletAccounts(coinAddress, network, isCanceled);
    const validAccounts = accounts.filter((a) => isValidAddress(a.address));
    const parallelCount = configs[network].api.maxParallel;
    let start = 0;
    while (true) {
        const accountBatch = validAccounts.slice(start, start + parallelCount);
        if (accountBatch.length === 0) break;
        const requests = accountBatch.map((a) => getWalletTokens(a.address, network, isCanceled));
        const tokensBatch = await Promise.all(requests);
        for (let i = 0; i < accountBatch.length; i++) {
            accountBatch[i].tokenValue = sumValues(tokensBatch[i].map((t) => t.value));
            accountBatch[i].tokens = tokensBatch[i];
        }
        start = start + parallelCount;
    }
    return accounts;
};

const getWalletAccountsWrapper = async (
    coinAddress: string[],
    network: MetaMask.Network,
    isCanceled: () => boolean,
): Promise<WalletAccount[] & { skip?: boolean }> => {
    return await executor(async () => {
        try {
            return await getWalletAccounts(coinAddress, network, isCanceled);
        } catch {
            return [];
        }
    });
};

const getWalletAccountsAndTokensWrapper = async (
    coinAddress: string[],
    network: MetaMask.Network,
    isCanceled: () => boolean,
): Promise<WalletAccount[] & { skip?: boolean }> => {
    return await executor(async () => {
        try {
            return await getWalletAccountsAndTokens(coinAddress, network, isCanceled);
        } catch {
            return [];
        }
    });
};

const getWalletTokensWrapper = async (
    address: string,
    network: MetaMask.Network,
    isCanceled: () => boolean,
): Promise<TokenDetailItem[] & { skip?: boolean }> => {
    return await executor(async () => {
        try {
            return await getWalletTokens(address, network, isCanceled);
        } catch {
            return [];
        }
    });
};

export const wallet = {
    getAccounts: getWalletAccountsWrapper,
    getAccountAndTokens: getWalletAccountsAndTokensWrapper,
    getAccountTokens: getWalletTokensWrapper,
};
