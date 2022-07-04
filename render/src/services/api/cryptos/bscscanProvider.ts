import type { Networkish } from '@ethersproject/networks';
import { EtherscanProvider } from '@ethersproject/providers/src.ts/etherscan-provider';
import { Logger } from '@ethersproject/logger';

const logger = new Logger('bscscanProvider');

export class BscscanProvider extends EtherscanProvider {
    constructor(networkName: 'mainnet' | 'testnet', apiKey: string) {
        let network: Networkish = 'invalid';
        switch (networkName) {
            case 'mainnet':
                network = {
                    name: 'bsc-mainnet',
                    chainId: 0x38,
                };
                break;
            case 'testnet':
                network = {
                    name: 'bsc-testnet',
                    chainId: 0x61,
                };
                break;
        }

        super(network, apiKey);
    }

    getBaseUrl(): string {
        switch (this.network ? this.network.name : 'invalid') {
            case 'bsc-mainnet':
                return 'http://api.bscscan.com';
            case 'bsc-testnet':
                return 'http://api-testnet.bscscan.com';
        }

        return logger.throwArgumentError('unsupported network', 'network', name);
    }

    isCommunityResource(): boolean {
        return this.apiKey === defaultApiKey;
    }
}
