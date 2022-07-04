import { requester, Result } from '@/services/api/requester';
import { TAuthentication } from '../model/TAuthentication';
import { TServerIdentifierProof } from '../model/TServerIdentifierProof';
import { TServerPublicKey } from '../model/TServerPublicKey';

export namespace cryptoServiceAPI {
    const baseurl: string = '/api/userKey';

    export async function exchangePublicKey(body: object): Promise<Result<TServerPublicKey>> {
        var path = baseurl + '/publickey';
        return await requester.post<TServerPublicKey>(path, body);
    }

    export async function authentication(
        body: TAuthentication,
    ): Promise<Result<TServerIdentifierProof>> {
        return await requester.post<TServerIdentifierProof>('/api/Tokens', body);
    }

    export async function distributeTo(body: any): Promise<Result<boolean>> {
        return await requester.post<boolean>(baseurl + '/distributedKey', body);
    }

    export async function getDataKeyForPersonal(body: any): Promise<Result<string>> {
        return await requester.post<string>('/api/me/userKey/datakey', body);
    }

    export async function getDataKeyForEnterprise(body: any): Promise<Result<string>> {
        return await requester.post<string>('/api/userKey/datakey', body);
    }

    export async function getUserPublicDataKey(userId: number): Promise<Result<string>> {
        return await requester.get<string>(`/api/userKey/publicdatakey/${userId}`);
    }

    export async function changePassword(body: any): Promise<Result<TServerPublicKey>> {
        return await requester.put<TServerPublicKey>(baseurl + '/userKey/password', body);
    }
}
