import { KeyPool } from '../apiKeyPool';
import { BaseApi } from './base';
import { IEtherContract, EthResult } from './definition';

class EtherContract extends BaseApi implements IEtherContract {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'contract', keyPool);
    }

    getAbi(params: { address: string }): Promise<EthResult> {
        return this.httpEthGet({
            action: 'getabi',
            ...params,
        });
    }

    getSourceCode(params: { address: string }): Promise<EthResult> {
        return this.httpEthGet({
            action: 'getsourcecode',
            ...params,
        });
    }
}

export default EtherContract;
