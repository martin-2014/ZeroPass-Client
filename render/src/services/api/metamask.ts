// @ts-ignore
import { decrypt, keyFromPassword, decryptWithKey } from 'browser-passworder';

const decryptVault = async (pwd: string, vault: string) => {
    return (await decrypt(pwd, vault)) as { type: string; data: any }[];
};

const decodeMnemonic = (mnemonic: any) => {
    if (typeof mnemonic === 'string') {
        return mnemonic;
    } else {
        return Buffer.from(mnemonic).toString('utf8');
    }
};

export const extractMnemonic = async (pwd: string, vault: string) => {
    const decryptedVault = await decryptVault(pwd, vault);
    for (let keyring of decryptedVault) {
        if ('mnemonic' in keyring.data) {
            return decodeMnemonic(keyring.data.mnemonic);
        }
    }
    return 'null';
};
