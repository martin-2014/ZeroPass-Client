import { requester, localRequester } from './requester';

export enum VaultItemType {
    Login = 0,
    SecureNodes = 1,
    CreditCard = 2,
    PersonalInfo = 3,
    MetaMaskRawData = 4,
    MetaMaskMnemonicPhrase = 5,
    Addresses = 6,
}

type VaultItemBase = {
    domainId: number;
    id: number;
    name: string;
    description: string;
    star: boolean;
    alias: string;
    type: VaultItemType;
    canAssign: boolean;
    containerId: string;
    lastModified: string;
    tags?: [];
};

export type VaultItem = VaultItemBase & {
    detail: any;
};

export type VaultItemView<T> = VaultItemBase & {
    detail: T;
};

export type VaultItemModel = {
    id?: number;
    name: string;
    description: string;
    itemType: VaultItemType;
    tagIds?: string[];
    tags?: string[];
};

export type SecureNoteDetail = {
    title: string;
    note: string;
};

export type PersonalInfoDetail = {
    title: string;
    fullName: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    note: string;
};

export type CreditCardDetail = {
    title: string;
    holder: string;
    number: string;
    expiry: string;
    cvv: string;
    zipOrPostalCode: string;
    pin: string;
    note: string;
};

export type MetaMaskMnemonicPhraseDetail = {
    title: string;
    mnemonicPhrase: string;
    walletPassword: string;
    defaultNetwork: number;
    note: string;
};

export type MetaMaskRawDataDetail = {
    title: string;
    dataFile: string;
    walletPassword: string;
    note: string;
};

export type AddressesDetail = {
    title: string;
    addresses: {
        address: string;
        privateKey: string;
        note: string;
    }[];
};

export type LoginDetail = VaultItem & {
    loginPassword: string;
    loginUri: string;
    loginUser: string;
    note: string;
    oneTimePassword: string;
};

export function getAllItems() {
    return localRequester<VaultItem[]>('getAllVaultItems');
}

export async function getItems(type: number) {
    return await requester.get<VaultItem[]>(`/api/items/typed/${type}`);
}

export function createPersonalItem<T = any>(data: Message.VaultItem) {
    return localRequester<T>('createVaultItem', { data: data });
}

export function updatePersonalItem<T = any>(data: Message.VaultItem) {
    return localRequester('updateVaultItem', { data: data });
}

export function patchPersonalItem<T = any>(data: Message.VaultItem) {
    return localRequester('patchVaultItem', { data: data });
}

export function deletePersonalItem(id: number) {
    return localRequester('deleteVaultItem', { id: id });
}

export function getPersonalItems(types: VaultItemType[] | VaultItemType) {
    const typeArr: VaultItemType[] = Array.isArray(types) ? [...types] : [types];
    return localRequester<VaultItem[]>('getVaultItems', { types: typeArr });
}

export function getPersonalItemTags(id: number | string) {
    return localRequester<{ id?: number; name: string }[]>('getVaultItemsByTag', { tag: id });
}

export function favouriteWorkItem(id: number) {
    return requester.post(`/api/me/items/work/${id}/star`);
}

export function unfavouriteWorkItem(id: number) {
    return requester.delete(`/api/me/items/work/${id}/star`);
}

export function updateWorkItemAlias(payload: { id: number; alias: string }) {
    return requester.put('/api/me/items/work/alias', payload);
}

export function updateWorkItemUsing(payload: { id: number; lastUsed: string }) {
    return requester.put('/api/me/items/work/using', { ...payload, id: +payload.id });
}

export type Access = {
    userId: number;
    canAssign: boolean;
};

export function updateWorkItem(payload: { id: number; alias: string; accesses: Access[] }) {
    return requester.put('/api/me/items/work', payload);
}

export function favouritePersonalItem(id: number) {
    return localRequester('favoriteVaultItem', { id: id });
}

export function unfavouritePersonalItem(id: number) {
    return localRequester('unfavoriteVaultItem', { id: id });
}

export function getPersonalFavouriteItems() {
    return localRequester<VaultItem[]>('getFavoriteVaultItem');
}

export function getPersonalItemsByTag(tag: string) {
    return localRequester<VaultItem[]>('getVaultItemsByTag', { tag: tag });
}

export function getWorkItemsByTagId(id: number) {
    return requester.get<VaultItem[]>(`/api/me/items/work/tagged/${id}`);
}

export function deletePersonalLogin(id: number) {
    return localRequester('deleteVaultItem', { id: id });
}

export function getPersonalLoginDetail<T = LoginDetail>(id: string | number) {
    return localRequester<T>('getVaultItemsById', { id: id });
}
