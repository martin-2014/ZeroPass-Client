import { requester } from './requester';

export class DomainUser {
    readonly id: number = 0;
    readonly email: string = '';
    readonly status: number = 0;

    get isActive(): boolean {
        return this.status == 1;
    }
}

export async function listDomainUsers() {
    return await requester.get<DomainUser[]>('/api/domainusers');
}
