export interface EthResult<T = any> {
    status: number;
    message: string;
    result: T;
}

export interface EthProxyResult<T = any> {
    jsonrpc: string;
    id: number;
    result: T;
}

export type EthSortType = 'asc' | 'desc';

export interface IEtherProxy {
    ethBlockNumber: () => Promise<EthProxyResult>;
    getEthBlockByNumber: (params: { tag: string; boolean: boolean }) => Promise<EthProxyResult>;
    getEthUncleByBlockNumberAndIndex: (params: {
        tag: string;
        index: string;
    }) => Promise<EthProxyResult>;
    getEthBlockTransactionCountByNumber: (params: { tag: string }) => Promise<EthProxyResult>;
    getEthTransactionByHash: (params: { txHash: string }) => Promise<EthProxyResult>;
    getEthTransactionByBlockNumberAndIndex: (params: {
        tag: string;
        index: string;
    }) => Promise<EthProxyResult>;
    getEthTransactionCount: (params: { address: string }) => Promise<EthProxyResult>;
    sendEthRawTransaction: (params: { hex: string }) => Promise<EthProxyResult>;
    getEthTransactionReceipt: (params: { txHash: string }) => Promise<EthProxyResult>;
    ethCall: (params: { to: string; data: string; tag: string }) => Promise<EthProxyResult>;
    getEthCode: (params: { address: string; tag: string }) => Promise<EthProxyResult>;
    getEthStorageAt: (params: {
        address: string;
        position: string;
        tag: string;
    }) => Promise<EthProxyResult>;
    ethGasPrice: () => Promise<EthProxyResult>;
    ethEstimateGas: (params: {
        to: string;
        value: string;
        gasPrice: string;
        gas: string;
    }) => Promise<EthProxyResult>;
}

export type TopicOpr = 'and' | 'or';

export interface IEtherLog {
    getLogs: (params: {
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
    }) => Promise<EthResult>;
}

export interface IEtherContract {
    getAbi: (params: { address: string }) => Promise<EthResult>;
    getSourceCode: (params: { address: string }) => Promise<EthResult>;
}

export type BlockCloseType = 'before' | 'after';

export interface IEtherBlock {
    getBlockReward: (params: { blockNo: number }) => Promise<EthResult>;
    getBlockCountDown: (params: { blockNo: number }) => Promise<EthResult>;
    getBlockNoByTime: (params: {
        timestamp: number;
        closest?: BlockCloseType;
    }) => Promise<EthResult>;
}

export interface IEtherAccount {
    tokenBalance: (params: { address: string; contractAddress: string }) => Promise<EthResult>;
    balance: (params: { address: string | string[] }) => Promise<EthResult>;
    txListInternal: (params: {
        txHash: string;
        address: string;
        startBlock?: number;
        endBlock?: number;
        sort?: EthSortType;
    }) => Promise<EthResult>;
    txList: (params: {
        address: string;
        startBlock?: number;
        endBlock?: number;
        page?: number;
        offset?: number;
        sort?: EthSortType;
    }) => Promise<EthResult>;
    getMinedBlocks: (params: { address: string }) => Promise<EthResult>;
    tokenTx: (params: {
        address: string;
        contractAddress?: string;
        startBlock?: number;
        endBlock?: number;
        page?: number;
        offset?: number;
        sort?: EthSortType;
    }) => Promise<EthResult>;
    tokenNtftTx: (params: {
        address: string;
        contractAddress?: string;
        page?: number;
        offset?: number;
        startBlock?: number;
        endBlock?: number;
        sort?: EthSortType;
    }) => Promise<EthResult>;
}

export type EthClientType = 'geth' | 'parity';
export type EthSyncMode = 'default' | 'archive';

export interface IEtherStat {
    tokenSupply: (params: { tokenName?: string; contractAddress?: string }) => Promise<EthResult>;
    ethSupply: () => Promise<EthResult>;
    ethPrice: () => Promise<EthResult>;
    ethSupplyV2: () => Promise<EthResult>;
    chainSize: (params: {
        startDate: Date;
        endDate: Date;
        clientType?: EthClientType;
        syncMode?: EthSyncMode;
        sort?: EthSortType;
    }) => Promise<EthResult>;
    nodeCount: () => Promise<EthResult>;
}

export interface IEtherTransaction {
    getStatus: (params: { txHash: string }) => Promise<EthResult>;
    getTxReceiptStatus: (params: { txHash: string }) => Promise<EthResult>;
}

export interface IEtherGasTracker {
    gasEstimate: (params: { gasPrice: number }) => Promise<EthResult>;
    gasOracle: () => Promise<EthResult>;
}

export const cleanUndefineProps = (obj: { [key: string]: any }) => {
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }
};
