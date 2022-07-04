import { ArrayBufferToHexString } from './unitity/unitity';
import { cryptoUntity } from './unitity/cryptoUntity';
import { SecretKey } from './SecretKey';

export class MasterKey {
    private _secretKey: SecretKey;
    private _crytpoKey: CryptoKey | undefined;

    public static async derive(masterPassword: string, secretKey: SecretKey): Promise<MasterKey> {
        var masterKey = new MasterKey(secretKey);
        return await masterKey.deriveMasterKey(masterPassword);
    }

    constructor(secretKey: SecretKey) {
        this._secretKey = secretKey;
    }

    public secretKey(): SecretKey {
        return this._secretKey;
    }

    public async export(): Promise<string> {
        if (this._crytpoKey === undefined) return '';

        const exported = await window.crypto.subtle.exportKey('raw', this._crytpoKey);
        return ArrayBufferToHexString(exported);
    }

    public async encryptText(plainText: string): Promise<string> {
        if (this._crytpoKey === undefined) return '';

        return await cryptoUntity.AES.encryptText(plainText, this._crytpoKey);
    }

    public async decryptText(cipherText: string): Promise<string> {
        if (this._crytpoKey === undefined) return '';

        return await cryptoUntity.AES.decryptText(cipherText, this._crytpoKey);
    }

    private async deriveMasterKey(masterPassword: string): Promise<MasterKey> {
        let enc = new TextEncoder();
        var pdkdf2Key = await window.crypto.subtle.importKey(
            'raw',
            enc.encode(masterPassword),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey'],
        );

        this._crytpoKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: this._secretKey.buffer,
                iterations: 100000,
                hash: 'SHA-256',
            },
            pdkdf2Key,
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt'],
        );

        return this;
    }
}
