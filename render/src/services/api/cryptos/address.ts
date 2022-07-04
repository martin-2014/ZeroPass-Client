import { IEtherApi } from './ether';
import { DataValue, TokenInfo } from './definition';
import { getAddressBalances } from 'eth-balance-checker/lib/ethers';
import { ethers } from 'ethers';
import { BscscanProvider } from './bscscanProvider';
import { bscApiKeyPool, ethApiKeyPool } from './apiKeyPool';

const address = function (api: IEtherApi, chainId: '0x1' | '0x3' | '0x38') {
    const balanceAddr = {
        '0x1': '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        '0x3': '0x4ddEA1706d037a550373D56FfF12Cb853D4c9096',
        '0x38': '0x2352c63A83f9Fd126af8676146721Fa00924d7e4',
    };

    const providerMap = {
        '0x1': 'homestead',
        '0x3': 'ropsten',
        '0x38': 'mainnet',
    };

    function getProvider(): ethers.providers.Provider {
        const bscscanProvider = new BscscanProvider('mainnet', bscApiKeyPool.getKey());
        const etherscanProvider = new ethers.providers.EtherscanProvider(
            providerMap[chainId],
            ethApiKeyPool.getKey(),
        );
        return chainId !== '0x38' ? etherscanProvider : bscscanProvider;
    }

    const getTokenBalanceOld = async (
        address: string,
        contractAddress: TokenInfo | TokenInfo[],
    ): Promise<{ [key: string]: string }> => {
        const isArray = Array.isArray(contractAddress);
        const result: { [key: string]: string } = {};
        let addrs: TokenInfo[];
        if (!isArray) {
            addrs = [contractAddress];
        } else {
            addrs = contractAddress;
        }
        for (const addr of addrs) {
            const res = await api.account.tokenBalance({
                address: address,
                contractAddress: addr.address,
            });
            if (res.status === 1) {
                result[addr.address] = res.result.toString();
            }
        }
        return result;
    };
    return {
        getAddressBalance: async (address: string | string[]): Promise<DataValue> => {
            const isArray = Array.isArray(address);
            if (isArray && address.length == 0) {
                return {};
            }
            const res = await api.account.balance({ address: address });
            return new Promise<DataValue>((resolve, reject) => {
                const result: DataValue = {};
                if (res.status === 1) {
                    if (!isArray) {
                        result[`${address}`] = res.result;
                    } else {
                        for (const data of res.result) {
                            result[data.account] = data.balance;
                        }
                    }
                    resolve(result);
                } else {
                    reject(res.message);
                }
            });
        },

        getTokenBalance: async (address: string, contractAddresses: TokenInfo[]) => {
            if (contractAddresses.length === 0) return {};
            try {
                return await getAddressBalances(
                    getProvider(),
                    address,
                    contractAddresses.map((c) => c.address),
                    { contractAddress: balanceAddr[chainId] },
                );
            } catch (e) {
                return await getTokenBalanceOld(address, contractAddresses);
            }
        },

        getTokens: async (address: string) => {
            const result: {
                [key: string]: TokenInfo;
            } = {};
            let startBlock = 0;
            const offset = 10000;
            while (true) {
                const res = await api.account.tokenTx({
                    address: address,
                    offset: offset,
                    startBlock: startBlock,
                    page: 1,
                });
                if (res.status === 1) {
                    for (const data of res.result) {
                        result[`${data.contractAddress}`.toLowerCase()] = {
                            address: `${data.contractAddress}`.toLowerCase(),
                            symbol: data.tokenSymbol,
                            name: data.tokenName,
                            decimal: +data.tokenDecimal,
                        };
                    }
                    if (res.result.length < offset) {
                        break;
                    }
                    const lastBlock = +res.result[res.result.length - 1].blockNumber;
                    startBlock = lastBlock + 1;
                } else {
                    break;
                }
            }
            return result;
        },

        getNfts: async (address: string) => {
            const result: {
                [key: string]: TokenInfo;
            } = {};
            let startBlock = 0;
            const offset = 10000;
            while (true) {
                const res = await api.account.tokenNtftTx({
                    address: address,
                    page: 1,
                    offset: offset,
                    startBlock: startBlock,
                });
                if (res.status === 1) {
                    for (const data of res.result) {
                        result[data.contractAddress] = {
                            symbol: data.tokenSymbol,
                            name: data.tokenName,
                            decimal: data.tokenDecimal,
                            address: data.contractAddress,
                        };
                    }
                    if (res.result.length < offset) {
                        break;
                    }
                    const lastBlock = +res.result[res.result.length - 1].blockNumber;
                    startBlock = lastBlock + 1;
                } else {
                    break;
                }
            }
            return result;
        },
    };
};
export { address };
