import { KeyPool } from '../apiKeyPool';
import { BaseApi } from './base';
import { IEtherProxy, EthProxyResult } from './definition';

class EtherProxy extends BaseApi implements IEtherProxy {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'proxy', keyPool);
    }

    ethBlockNumber(): Promise<EthProxyResult> {
        const params = {
            action: 'eth_blockNumber',
        };
        return this.httpProxyGet(params);
    }

    getEthBlockByNumber(params: { tag: string; boolean: boolean }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getBlockByNumber',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthUncleByBlockNumberAndIndex(params: {
        tag: string;
        index: string;
    }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getUncleByBlockNumberAndIndex',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthBlockTransactionCountByNumber(params: { tag: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getBlockTransactionCountByNumber',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthTransactionByHash(params: { txHash: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getTransactionByHash',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthTransactionByBlockNumberAndIndex(params: {
        tag: string;
        index: string;
    }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getTransactionByBlockNumberAndIndex',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthTransactionCount(params: { address: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getTransactionCount',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    sendEthRawTransaction(params: { hex: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_sendRawTransaction',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthTransactionReceipt(params: { txHash: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getTransactionReceipt',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    ethCall(params: { to: string; data: string; tag: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_call',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthCode(params: { address: string; tag: string }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getCode',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    getEthStorageAt(params: {
        address: string;
        position: string;
        tag: string;
    }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_getStorageAt',
            ...params,
        };
        return this.httpProxyGet(_params);
    }

    ethGasPrice(): Promise<EthProxyResult> {
        const params = {
            action: 'eth_gasPrice',
        };
        return this.httpProxyGet(params);
    }

    ethEstimateGas(params: {
        to: string;
        value: string;
        gasPrice: string;
        gas: string;
    }): Promise<EthProxyResult> {
        const _params = {
            action: 'eth_estimateGas',
            ...params,
        };
        return this.httpProxyGet(_params);
    }
}

export default EtherProxy;
