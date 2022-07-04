import { localRequester } from './requester';

export type PasswordHistoryItem = {
    id?: number;
    password: string;
    source: number;
    description: string;
    createTime?: string;
};

export function getPasswordHistoryAll() {
    return localRequester<PasswordHistoryItem[]>('getPwdHistories');
}

export function postPasswordHistory(params: PasswordHistoryItem) {
    return localRequester<PasswordHistoryItem>('addPwdHistory', { data: params });
}

export function deletePasswordHistory(id: number) {
    return localRequester('deletePwdHistory', { id: id });
}

export function deletePasswordHistoryAll() {
    return localRequester('deleteAllPwdHistories');
}
