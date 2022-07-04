import {
    ArrayBufferToBase64,
    Base64ToBuffer,
    HexStringToArrayBuffer,
    ArrayBufferToHexString,
} from './unitity';

export namespace cryptoUntity {
    export class HMAC {
        public static async importKey(hexRawKey: string): Promise<CryptoKey> {
            let enc = new TextEncoder();
            var rawBuffer = enc.encode(hexRawKey);

            return await window.crypto.subtle.importKey(
                'raw',
                rawBuffer,
                {
                    name: 'HMAC',
                    hash: 'SHA-256',
                },
                true,
                ['sign'],
            );
        }

        public static async sign(payload: string, signKey: string): Promise<string> {
            var cryptoKey = await HMAC.importKey(signKey);

            let enc = new TextEncoder();
            let signature = await window.crypto.subtle.sign(
                'HMAC',
                cryptoKey,
                enc.encode(payload.toLowerCase()),
            );

            return ArrayBufferToBase64(signature);
        }
    }

    type RSAAlgorithmName = 'RSASSA-PKCS1-v1_5' | 'RSA-PSS' | 'RSA-OAEP';

    export class RSA {
        static importKey(
            base64Key: string,
            isPrivateKey: boolean,
            algorithmName: RSAAlgorithmName,
            format: KeyUsage,
        ): Promise<CryptoKey> {
            return window.crypto.subtle.importKey(
                isPrivateKey ? 'pkcs8' : 'spki',
                Buffer.from(base64Key, 'base64'),
                {
                    name: algorithmName,
                    hash: 'SHA-256',
                },
                false,
                [format],
            );
        }

        public static async encryptText(plainText: string, spkiPublicKey: string): Promise<string> {
            const cryptoKey = await RSA.importKey(spkiPublicKey, false, 'RSA-OAEP', 'encrypt');
            let encrypted = await window.crypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                cryptoKey,
                Buffer.from(plainText),
            );
            return Buffer.from(encrypted).toString('base64');
        }

        public static async decryptText(plainText: string, pkcs8PrivateKey: string) {
            const cryptoKey = await RSA.importKey(pkcs8PrivateKey, true, 'RSA-OAEP', 'decrypt');
            let encrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'RSA-OAEP',
                },
                cryptoKey,
                Buffer.from(plainText, 'base64'),
            );
            return Buffer.from(encrypted).toString();
        }

        public static async signData(plainText: string, pkcs8PrivateKey: string): Promise<string> {
            const cryptoKey = await RSA.importKey(
                pkcs8PrivateKey,
                true,
                'RSASSA-PKCS1-v1_5',
                'sign',
            );
            const sign = await window.crypto.subtle.sign(
                'RSASSA-PKCS1-v1_5',
                cryptoKey,
                Buffer.from(plainText),
            );
            return Buffer.from(sign).toString('base64');
        }

        public static async verifyData(
            spkiPublicKey: string,
            plainText: string,
            signature: string,
        ): Promise<boolean> {
            const cryptoKey = await RSA.importKey(
                spkiPublicKey,
                false,
                'RSASSA-PKCS1-v1_5',
                'verify',
            );
            const result = await window.crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                cryptoKey,
                Buffer.from(signature, 'base64'),
                Buffer.from(plainText),
            );
            return result;
        }
    }

    export class AES {
        private static readonly IV_ByteSize: number = 12;
        private static readonly Tag_BitSize: number = 128;

        public static async generateKeyObject(): Promise<CryptoKey> {
            return await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt'],
            );
        }

        public static async generateKey(): Promise<string> {
            var cryptoKey = await this.generateKeyObject();
            return await AES.exportKey(cryptoKey);
        }

        public static async importKey(rawHexKey: string): Promise<CryptoKey> {
            var rawBuffer = HexStringToArrayBuffer(rawHexKey);
            return await window.crypto.subtle.importKey('raw', rawBuffer, 'AES-GCM', true, [
                'encrypt',
                'decrypt',
            ]);
        }

        public static async exportKey(aesKey: CryptoKey): Promise<string> {
            const exported = await window.crypto.subtle.exportKey('raw', aesKey);
            return ArrayBufferToHexString(exported);
        }

        public static async encryptObject(
            object: Object,
            encrytpKey: CryptoKey | string,
        ): Promise<string> {
            if (typeof object === 'string') {
                return await AES.encryptText(object, encrytpKey);
            } else {
                return await AES.encryptText(JSON.stringify(object), encrytpKey);
            }
        }

        public static async encryptText(
            plainText: string,
            encrytpKey: CryptoKey | string,
        ): Promise<string> {
            var cryptoKey: CryptoKey;
            if (typeof encrytpKey === 'string') {
                cryptoKey = await AES.importKey(encrytpKey);
            } else {
                cryptoKey = encrytpKey;
            }

            var iv = window.crypto.getRandomValues(new Uint8Array(AES.IV_ByteSize));
            let enc = new TextEncoder();
            var cryptoTextBuffer = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: AES.Tag_BitSize,
                },
                cryptoKey,
                enc.encode(plainText),
            );

            var resultBuffer = Buffer.concat([iv, new Uint8Array(cryptoTextBuffer)]);
            return ArrayBufferToBase64(resultBuffer);
        }

        public static async decryptText(
            cipherText: string,
            decrytpKey: CryptoKey | string,
        ): Promise<string> {
            var cryptoKey: CryptoKey;
            if (typeof decrytpKey === 'string') {
                cryptoKey = await AES.importKey(decrytpKey);
            } else {
                cryptoKey = decrytpKey;
            }

            var cipherBuffer = Base64ToBuffer(cipherText);
            var plainTextBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: Uint8Array.from(cipherBuffer).slice(0, AES.IV_ByteSize),
                    tagLength: AES.Tag_BitSize,
                },
                cryptoKey,
                Uint8Array.from(cipherBuffer).slice(AES.IV_ByteSize),
            );

            var dec = new TextDecoder();
            return dec.decode(plainTextBuffer);
        }

        public static async digest(data: string) {
            let enc = new TextEncoder();
            var digestBuffer = await crypto.subtle.digest('SHA-256', enc.encode(data));
            return ArrayBufferToBase64(digestBuffer);
        }
    }
}
