import { requester, localRequester } from './requester';

export type TagResultItem = {
    id?: number;
    name: string;
};
const TAG_URI = '/api/VaultItemTags';
export function getVaultTags() {
    return requester.get<TagResultItem[]>(TAG_URI);
}

export function createVaultTags(payload: any) {
    return requester.post<{ id: number }>(TAG_URI, payload);
}

const ME_PERSONAL_URI = '/api/me/tags/personal';
export function createPersonalEntryTag(payload: any) {
    return requester.post<{ id: number }>(ME_PERSONAL_URI, payload);
}

export function getPersonalEntryTag() {
    return localRequester<TagResultItem[]>('getVaultItemTags');
}

export function getPersonalVisibleEntryTag() {
    return requester.get<TagResultItem[]>(`${ME_PERSONAL_URI}/visible`);
}
