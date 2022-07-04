import { ArrayBufferToHexString, HexStringToArrayBuffer } from '../unitity/unitity';
import { MasterKey } from '../MasterKey';
import { TClientKeyPair, TServerPublicKey } from './TServerPublicKey';
import { TClientIdentifierProof } from './TClientIdentifierProof';
import secretRemotePassword from 'secure-remote-password/client';

export class TClientSession {
    private _clientIdentifierProof: TClientIdentifierProof;
    private _communicateKey: string;
    private _masterKey: string;

    public static async generateSession(
        accountName: string,
        masterKey: MasterKey,
        clientKeyPair: TClientKeyPair,
        serverPublicKey: TServerPublicKey,
    ): Promise<TClientSession> {
        var token = new TClientSession();
        return await token.generate(accountName, masterKey, clientKeyPair, serverPublicKey);
    }

    constructor() {
        this._clientIdentifierProof = new TClientIdentifierProof();
        this._communicateKey = '';
        this._masterKey = '';
    }

    private async generate(
        accountName: string,
        masterKey: MasterKey,
        clientKeyPair: TClientKeyPair,
        serverPublicKey: TServerPublicKey,
    ) {
        const exportedmasterKey = await masterKey.export();
        const privateKey = secretRemotePassword.derivePrivateKey(
            serverPublicKey.additionalData,
            accountName.toLowerCase(),
            exportedmasterKey,
        );
        const srpSession = secretRemotePassword.deriveSession(
            clientKeyPair.privateKey,
            serverPublicKey.publicKey,
            serverPublicKey.additionalData,
            accountName.toLowerCase(),
            privateKey,
        );

        this._communicateKey = srpSession.key;
        this._clientIdentifierProof.Email = accountName;
        this._clientIdentifierProof.IdentifierProof = srpSession.proof;
        this._masterKey = exportedmasterKey;

        return this;
    }

    public export(): string {
        var json = JSON.stringify(this);
        let enc = new TextEncoder();

        return ArrayBufferToHexString(enc.encode(json));
    }

    public import(storage: string) {
        let dec = new TextDecoder();
        let json = dec.decode(HexStringToArrayBuffer(storage));
        var obj = JSON.parse(json);

        this._communicateKey = obj._communicateKey;
        this._clientIdentifierProof = obj._clientIdentifierProof;
        this._masterKey = obj._masterKey;

        return this;
    }

    //keyName
    get accountName() {
        return this._clientIdentifierProof.Email;
    }

    get CommunicateKey() {
        return this._communicateKey;
    }

    get ClientIdentifierProof(): TClientIdentifierProof {
        return this._clientIdentifierProof;
    }

    get MasterKey() {
        return this._masterKey;
    }
}
