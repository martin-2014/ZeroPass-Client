import { IEtherTransaction, EthResult } from './definition';
import { BaseApi } from './base';
import { KeyPool } from '../apiKeyPool';

class EtherTransaction extends BaseApi implements IEtherTransaction {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'transaction', keyPool);
    }

    getStatus(params: { txHash: string }): Promise<EthResult> {
        const _params = {
            action: 'getstatus',
            ...params,
        };
        return this.httpEthGet(_params);
    }

    getTxReceiptStatus(params: { txHash: string }): Promise<EthResult> {
        const _params = {
            action: 'gettxreceiptstatus',
            ...params,
        };
        return this.httpEthGet(_params);
    }
}

export default EtherTransaction;
