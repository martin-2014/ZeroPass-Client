import { KeyPool } from '../apiKeyPool';
import { BaseApi } from './base';
import { TopicOpr, IEtherLog, EthResult, cleanUndefineProps } from './definition';

class EtherLog extends BaseApi implements IEtherLog {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'logs', keyPool);
    }

    getLogs(params: {
        address: string;
        fromBlock?: number;
        toBlock?: number;
        topic0?: string;
        topic0_1_opr?: TopicOpr;
        topic1?: string;
        topic1_2_opr?: TopicOpr;
        topic2?: string;
        topic2_3_opr?: TopicOpr;
        topic3?: string;
        topic0_2_opr?: TopicOpr;
    }): Promise<EthResult> {
        const _params = {
            address: params.address,
            action: 'getLogs',
            fromBlock: params.fromBlock ?? 0,
            toBlock: params.toBlock ?? 'lastest',
            topic0: params.topic0,
            topic0_1_opr: params.topic0_1_opr,
            topic1: params.topic1,
            topic1_2_opr: params.topic1_2_opr,
            topic2: params.topic2,
            topic2_3_opr: params.topic2_3_opr,
            topic3: params.topic3,
            topic0_2_opr: params.topic0_2_opr,
        };
        cleanUndefineProps(_params);
        return this.httpEthGet(_params);
    }
}

export default EtherLog;
