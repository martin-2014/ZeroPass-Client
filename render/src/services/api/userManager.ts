// @ts-ignore
/* eslint-disable */
import { requester } from '@/services/api/requester';

const INVITE_URI = '/api/invites';

export async function rejectInvite(params: any) {
    return await requester.delete(INVITE_URI, params);
}

export async function acceptInvite(domainId: number) {
    return await requester.post(`${INVITE_URI}/accept`, { domainId: domainId });
}
