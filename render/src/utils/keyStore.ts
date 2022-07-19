import { TEncryptionKey } from '@/secretKey/secretKey';

export class KeyStore {
    private personalKeyId: string = '';
    private enterpriseKeyId: string = '';
    private encryptionKeyObj: TEncryptionKey;

    constructor(personal: string, enterprise: string, encryptionKey: TEncryptionKey) {
        this.personalKeyId = personal;
        this.enterpriseKeyId = enterprise;
        this.encryptionKeyObj = encryptionKey;
    }

    setPersonal(keyId: string) {
        this.personalKeyId = keyId;
    }

    setEnterprise(keyId: string) {
        this.enterpriseKeyId = keyId;
    }

    setEncryptionKey(key: TEncryptionKey) {
        this.encryptionKeyObj = key;
    }

    async encryptPersonalData(data: string): Promise<string> {
        if (this.encryptionKeyObj)
            return await this.encryptionKeyObj.encryptDataWith(data, this.personalKeyId);
        else return '';
    }

    async encryptEnterpriseData(data: string): Promise<string> {
        if (this.encryptionKeyObj)
            return await this.encryptionKeyObj.encryptDataWith(data, this.enterpriseKeyId);
        else return '';
    }

    async decryptPersonalData(data: string): Promise<string> {
        if (this.personalKeyId !== '')
            return await this.encryptionKeyObj.decryptDataWith(data, this.personalKeyId);
        else return '';
    }

    async decryptEnterpriseData(data: string): Promise<string> {
        if (this.enterpriseKeyId !== '')
            return await this.encryptionKeyObj.decryptDataWith(data, this.enterpriseKeyId);
        else return '';
    }

    async approveUser(email: string): Promise<boolean> {
        return await this.encryptionKeyObj.distributeTo(email, this.enterpriseKeyId, true);
    }
}

let keyStoreInstance: KeyStore | undefined;

export const getKeyStore = async () => {
    return keyStoreInstance;
};

export const setKeyStore = async (instance: KeyStore) => {
    keyStoreInstance = instance;
};
