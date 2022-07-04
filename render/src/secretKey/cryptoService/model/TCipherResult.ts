export class TCipherResult {
    version: string = '';
    type: string = '';
    keyId: string = '';
    itemDataKey: string = ''; //用keyId 加密了
    cipherText: string = '';
    signature: string = '';
}
