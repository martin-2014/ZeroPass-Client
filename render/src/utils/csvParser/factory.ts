import { VaultItemType } from '@/services/api/vaultItems';
import { ItemCsvParser } from './base';
import loginParser from './login';

export const createParser = (type: VaultItemType): ItemCsvParser => {
    switch (type) {
        case VaultItemType.Login:
            return loginParser;
        default:
            throw Error(`No importer for ${type}`);
    }
};
