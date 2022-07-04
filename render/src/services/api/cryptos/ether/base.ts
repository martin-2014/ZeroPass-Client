import { KeyPool } from '../apiKeyPool';
import { EthProxyResult, EthResult } from './definition';

export class BaseApi {
    private url: string;
    private module: string;
    private keyPool: KeyPool;

    constructor(url: string, module: string, keyPool: KeyPool) {
        this.url = url;
        this.module = module;
        this.keyPool = keyPool;
    }

    async httpGet<T>(params?: { [key: string]: any }): Promise<T> {
        const _params = {
            module: this.module,
            apiKey: this.keyPool.getKey(),
            ...params,
        };
        const res = await fetch(`${this.url}?${new URLSearchParams(_params)}`, {
            method: 'GET',
        });
        return res.json();
    }

    httpEthGet<T = any>(params?: { [key: string]: any }): Promise<EthResult<T>> {
        const self = this;
        const initialInterval = 1000;
        const timeout = 30000;
        // Max rate limit reached, please use API Key for higher rate limit
        const promise = new Promise<EthResult<T>>(async (resolve, reject) => {
            const startTime = new Date();
            const retryPromise = async (preInterval?: number) => {
                if (Date.now() - startTime.getTime() > timeout) {
                    reject(new Error('Eth request timeout'));
                }
                try {
                    const res = await self.httpGet<EthResult<T>>(params);
                    res.status = +res.status;
                    if (res.status === 1) {
                        return resolve(res);
                    }
                    const result = res?.result;
                    if (typeof result === 'string' && result.includes('rate limit reached')) {
                        setTimeout(() => {
                            retryPromise(preInterval ? preInterval * 2 : initialInterval);
                        }, preInterval);
                    }
                    return resolve(res);
                } catch (err) {
                    console.log('Eth request error', err);
                    reject(new Error('Eth request error'));
                }
            };
            retryPromise();
        });
        return promise;
    }

    httpProxyGet<T = any>(params?: { [key: string]: any }): Promise<EthProxyResult<T>> {
        return this.httpGet<EthProxyResult<T>>(params);
    }
}
