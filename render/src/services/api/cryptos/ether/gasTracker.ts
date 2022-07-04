import { KeyPool } from '../apiKeyPool';
import { BaseApi } from './base';
import { IEtherGasTracker, EthResult } from './definition';

class EtherGasTracker extends BaseApi implements IEtherGasTracker {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'gastracker', keyPool);
    }

    gasEstimate(params: { gasPrice: number }): Promise<EthResult> {
        const _params = {
            action: 'gasestimate',
            ...params,
        };
        return this.httpEthGet(_params);
    }

    gasOracle(): Promise<EthResult> {
        const params = {
            action: 'gasoracle',
        };
        return this.httpEthGet(params);
    }
}

export default EtherGasTracker;
