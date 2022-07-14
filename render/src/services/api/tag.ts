import { localRequester } from './requester';

export type TagResultItem = {
    id?: number;
    name: string;
};

export function getPersonalEntryTag() {
    return localRequester<TagResultItem[]>('getVaultItemTags');
}
