export class TServerPublicKey {
    public exchangeKeyId: string;
    public publicKey: string;
    public additionalData: string | undefined;

    constructor(keyId: string, publicKey: string, salt: string | undefined = undefined) {
        this.exchangeKeyId = keyId;
        this.publicKey = publicKey;
        this.additionalData = salt;
    }
}

export class TClientKeyPair {
    public publicKey: string;
    public privateKey: string;

    constructor(privateKey: string, publicKey: string) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }
}
