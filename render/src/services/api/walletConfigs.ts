import { etherApi } from './cryptos';
import { IEtherApi } from './cryptos/ether';

type networkConfig = {
    network: MetaMask.Network;
    chainId: '0x1' | '0x3' | '0x38';
    symbol: string;
    api: IEtherApi;
    name: string;
    url: string;
    icon: string;
    defaultTokenIcon: string;
};

const networkMapping: Record<MetaMask.Network, networkConfig> = {
    bsc: {
        network: 'bsc',
        chainId: '0x38',
        symbol: 'BNB',
        api: etherApi.bscMainnet,
        name: 'BSC Mainnet',
        url: 'bscscan.com',
        icon: 'bnb.png',
        defaultTokenIcon: 'empty-token-bnb.png',
    },
    etherenum: {
        network: 'etherenum',
        chainId: '0x1',
        symbol: 'ETH',
        api: etherApi.etherMainnet,
        name: 'Etherenum Mainnet',
        url: 'etherscan.io',
        icon: 'ether.png',
        defaultTokenIcon: 'empty-token-ether.png',
    },
    ropsten: {
        network: 'ropsten',
        chainId: '0x3',
        symbol: 'ETH',
        api: etherApi.etherRopsten,
        name: 'Ropsten Test Network',
        url: 'ropsten.etherscan.io',
        icon: 'ether.png',
        defaultTokenIcon: 'empty-token-ether.png',
    },
};

const getOnlineUrl = (address: string, network: MetaMask.Network) => {
    return `https://${networkMapping[network].url}/address/${address}`;
};

const getNetworkName = (network: MetaMask.Network) => {
    return networkMapping[network].name;
};

const getSymbol = (network: MetaMask.Network) => {
    return networkMapping[network].symbol;
};

const getIcon = (network: MetaMask.Network) => {
    return networkMapping[network].icon;
};

const networks = Object.values(networkMapping);

export const walletConfigs = {
    value: networkMapping,
    networks,
    getOnlineUrl,
    getNetworkName,
    getSymbol,
    getIcon,
};
