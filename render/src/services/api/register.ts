import { TCreateKeyModel } from '@/secretKey/cryptoService/model/TRegisterModel';
import { requester } from './requester';

export type RegisterItem = {
    email: string;
    code: string;
    activateType: number;
    keyId?: string;
    raw: any;
    userKey: TCreateKeyModel;
};

export function checkPersonalEmail(email: string) {
    return requester.get(`/api/Users/registration/${email}`);
}

export async function sendPersonalCode(params: API.RegisterItem) {
    return await requester.post('/api/Users/registration', params);
}

export async function checkRegisterCode(email: string, code: string) {
    return await requester.get<RegisterItem>('/api/Activation', { email: email, code: code });
}

export async function register(params: RegisterItem) {
    return await requester.post('/api/Activation', params);
}
