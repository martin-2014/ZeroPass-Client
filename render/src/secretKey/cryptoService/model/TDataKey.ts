export interface TDataKey {
    PublicKey: string;
    SelfPrivateKey: string;
    AssignerPrivateKey?: string;
    AssignerId: number;
}

export interface TSharedDataKey {
    Version: number;
    CipherText: string;
    ItemKey: string;
}
