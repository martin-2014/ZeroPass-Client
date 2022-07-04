import { KeyPool } from '../apiKeyPool';
import { BaseApi } from './base';
import { BlockCloseType, IEtherBlock, EthResult } from './definition';

class EtherBlock extends BaseApi implements IEtherBlock {
    constructor(url: string, keyPool: KeyPool) {
        super(url, 'block', keyPool);
    }

    getBlockReward(params: { blockNo: number }): Promise<EthResult> {
        return this.httpEthGet({
            action: 'getblockreward',
            ...params,
        });
    }

    getBlockCountDown(params: { blockNo: number }): Promise<EthResult> {
        return this.httpEthGet({
            action: 'getblockcountdown',
            ...params,
        });
    }

    getBlockNoByTime(params: { timestamp: number; closest?: BlockCloseType }): Promise<EthResult> {
        return this.httpEthGet({
            action: 'getblocknobytime',
            timestamp: params.timestamp,
            closest: params.closest ?? 'before',
        });
    }
}

export default EtherBlock;
