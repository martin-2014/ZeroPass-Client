import { EtherAccount } from './account';
import EtherBlock from './block';
import EtherContract from './contract';
import EtherLog from './log';
import {
    IEtherAccount,
    IEtherBlock,
    IEtherContract,
    IEtherGasTracker,
    IEtherLog,
    IEtherProxy,
    IEtherStat,
    IEtherTransaction,
} from './definition';
import EtherProxy from './proxy';
import EtherStat from './stat';
import EtherTransaction from './transaction';
import EtherGasTracker from './gasTracker';
import { KeyPool } from '../apiKeyPool';

export interface IEtherApi {
    account: IEtherAccount;
    block: IEtherBlock;
    contract: IEtherContract;
    log: IEtherLog;
    proxy: IEtherProxy;
    stat: IEtherStat;
    transaction: IEtherTransaction;
    gasTracker: IEtherGasTracker;
    maxParallel: number;
}

class EtherApi implements IEtherApi {
    private _account: IEtherAccount;
    private _apiUrl: string;
    private _block: IEtherBlock;
    private _contract: IEtherContract;
    private _log: IEtherLog;
    private _proxy: IEtherProxy;
    private _stat: IEtherStat;
    private _transaction: IEtherTransaction;
    private _gasTracker: IEtherGasTracker;
    private _maxParallel: number;

    constructor(chain: string, keyPool: KeyPool, parallel?: number) {
        this._apiUrl = `${chain}/api`;
        this._account = new EtherAccount(this._apiUrl, keyPool);
        this._block = new EtherBlock(this._apiUrl, keyPool);
        this._contract = new EtherContract(this._apiUrl, keyPool);
        this._log = new EtherLog(this._apiUrl, keyPool);
        this._proxy = new EtherProxy(this._apiUrl, keyPool);
        this._stat = new EtherStat(this._apiUrl, keyPool);
        this._transaction = new EtherTransaction(this._apiUrl, keyPool);
        this._gasTracker = new EtherGasTracker(this._apiUrl, keyPool);
        this._maxParallel = parallel ?? keyPool.size;
    }

    get account() {
        return this._account;
    }

    get block() {
        return this._block;
    }

    get contract() {
        return this._contract;
    }

    get log() {
        return this._log;
    }

    get proxy() {
        return this._proxy;
    }

    get stat() {
        return this._stat;
    }

    get transaction() {
        return this._transaction;
    }

    get gasTracker() {
        return this._gasTracker;
    }

    get maxParallel() {
        return this._maxParallel;
    }
}

export default EtherApi;
