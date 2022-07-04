import { BaseApi } from './base';
import {
    IEtherStat,
    EthClientType,
    EthSortType,
    EthSyncMode,
    EthResult,
    cleanUndefineProps,
} from './definition';
import moment from 'moment';
import { KeyPool } from '../apiKeyPool';

class EtherStat extends BaseApi implements IEtherStat {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'stats', keyPool);
    }

    tokenSupply(params: { tokenName?: string; contractAddress?: string }): Promise<EthResult> {
        const _params = {
            action: 'tokensupply',
            ...params,
        };
        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }

    ethSupply(): Promise<EthResult> {
        const params = {
            action: 'ethsupply',
        };
        return this.httpEthGet(params);
    }

    ethPrice(): Promise<EthResult> {
        const params = {
            action: 'ethprice',
        };
        return this.httpEthGet(params);
    }

    ethSupplyV2(): Promise<EthResult> {
        const params = {
            action: 'ethsupply2',
        };
        return this.httpEthGet(params);
    }

    chainSize(params: {
        startDate: Date;
        endDate: Date;
        clientType?: EthClientType;
        syncMode?: EthSyncMode;
        sort?: EthSortType;
    }): Promise<EthResult> {
        const _params = {
            action: 'chainsize',
            startdate: moment(params.startDate).format('YYYY-MM-DD'),
            enddate: moment(params.endDate).format('YYYY-MM-DD'),
            clienttype: params.clientType ?? 'geth',
            syncmode: params.syncMode ?? 'default',
            sort: params.sort ?? 'asc',
        };
        return this.httpEthGet(_params);
    }

    nodeCount(): Promise<EthResult> {
        const params = {
            action: 'nodecount',
        };
        return this.httpEthGet(params);
    }
}

export default EtherStat;
