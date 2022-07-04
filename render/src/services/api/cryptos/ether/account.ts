import { KeyPool } from '../apiKeyPool';
import { BaseApi } from './base';
import { EthSortType, EthResult, IEtherAccount, cleanUndefineProps } from './definition';

class EtherAccount extends BaseApi implements IEtherAccount {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'account', keyPool);
    }
    tokenBalance(params: { address: string; contractAddress: string }): Promise<EthResult> {
        const _params = {
            action: 'tokenbalance',
            tag: 'latest',
            ...params,
        };
        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }

    balance(params: { address: string | string[] }): Promise<EthResult> {
        const isArray = Array.isArray(params.address);
        const _params = {
            action: isArray ? 'balancemulti' : 'balance',
            tag: 'latest',
            address: isArray ? (params.address as string[]).join(',') : params.address,
        };
        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }

    txListInternal(params: {
        txHash: string;
        address: string;
        startBlock?: number;
        endBlock?: number;
        sort?: EthSortType;
    }): Promise<EthResult> {
        const _params = {
            action: 'txlistinternal',
            txhash: params.txHash,
            address: params.address,
            startblock: params.startBlock ?? 0,
            endBlock: params.endBlock ?? 'lastest',
            sort: params.sort ?? 'asc',
        };

        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }

    txList(params: {
        address: string;
        startBlock?: number;
        endBlock?: number;
        page?: number;
        offset?: number;
        sort?: EthSortType;
    }): Promise<EthResult> {
        const _params = {
            action: 'txlist',
            address: params.address,
            startblock: params.startBlock ?? 0,
            endblock: params.endBlock ?? 'lastest',
            page: params.page ?? 1,
            offset: params.offset ?? 100,
            sort: params.sort ?? 'asc',
        };

        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }

    getMinedBlocks(params: { address: string }): Promise<EthResult> {
        return this.httpEthGet({
            action: 'getminedblocks',
            ...params,
        });
    }

    tokenTx(params: {
        address: string;
        contractAddress?: string;
        startBlock?: number;
        endBlock?: number;
        page?: number;
        offset?: number;
        sort?: EthSortType;
    }): Promise<EthResult> {
        const _params = {
            action: 'tokentx',
            address: params.address,
            contractaddress: params.contractAddress,
            startblock: params.startBlock ?? 0,
            endblock: params.endBlock ?? 'latest',
            page: params.page ?? 1,
            offset: params.offset ?? 1000,
            sort: params.sort ?? 'asc',
        };
        cleanUndefineProps(_params);

        return this.httpEthGet(_params);
    }
    tokenNtftTx(params: {
        address: string;
        contractAddress?: string;
        page?: number;
        offset?: number;
        startBlock?: number;
        endBlock?: number;
        sort?: EthSortType;
    }): Promise<EthResult> {
        const _params = {
            action: 'tokennfttx',
            address: params.address,
            contractaddress: params.contractAddress,
            page: params.page ?? 1,
            offset: params.offset ?? 1000,
            startblock: params.startBlock ?? 0,
            endblock: params.endBlock ?? 'latest',
            sort: params.sort ?? 'asc',
        };
        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }
}
export { EtherAccount };
