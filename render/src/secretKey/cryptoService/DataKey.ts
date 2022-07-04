import { ArrayBufferToBase64 } from './unitity/unitity';

export class DataKey {
    public static async generate() {
        var dataKey = new DataKey();
        var keyPair = await dataKey.generateRSAKey();
        const privateKey = await dataKey.exportPrivateKey(keyPair.privateKey);
        const publicKey = await dataKey.exportPublicKey(keyPair.publicKey);

        return {
            PrivateKey: privateKey,
            PublicKey: publicKey,
        };
    }

    async exportPrivateKey(privateKey?: CryptoKey): Promise<string> {
        if (privateKey === undefined) return '';

        const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', privateKey);
        return ArrayBufferToBase64(privateKeyBuffer);
    }

    async exportPublicKey(publicKey?: CryptoKey): Promise<string> {
        if (publicKey === undefined) return '';

        const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', publicKey);
        return ArrayBufferToBase64(publicKeyBuffer);
    }

    async generateRSAKey(): Promise<CryptoKeyPair> {
        return await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt'],
        );
    }
}
