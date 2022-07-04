import { bscApiKeyPool, ethApiKeyPool } from './apiKeyPool';
import EtherApi from './ether';
import { IEtherApi } from './ether';

const etherMainnet: IEtherApi = new EtherApi('https://api.etherscan.io', ethApiKeyPool);

const etherGoerli: IEtherApi = new EtherApi('https://api-goerli.etherscan.io', ethApiKeyPool);

const etherKovan: IEtherApi = new EtherApi('https://api-kovan.etherscan.io', ethApiKeyPool);

const etherRInkeby: IEtherApi = new EtherApi('https://api-rinkeby.etherscan.io', ethApiKeyPool);

const etherRopsten: IEtherApi = new EtherApi('https://api-ropsten.etherscan.io', ethApiKeyPool, 1);

const etherSepolia: IEtherApi = new EtherApi('https://api-sepolia.etherscan.io', ethApiKeyPool);

const bscMainnet: IEtherApi = new EtherApi('https://api.bscscan.com', bscApiKeyPool);

const bscTestnet: IEtherApi = new EtherApi('https://api-testnet.bscscan.com', bscApiKeyPool);

export const etherApi = {
    etherMainnet: etherMainnet,
    etherGoerli: etherGoerli,
    etherKovan: etherKovan,
    etherRInkeby: etherRInkeby,
    etherRopsten: etherRopsten,
    etherSepolia: etherSepolia,
    bscMainnet: bscMainnet,
    bscTestnet: bscTestnet,
};
