import { requester } from './requester';

export type clientMinVersionModel = {
    meetMinVersion: boolean;
    minVersion: string;
};

export function checkClientMinVersion() {
    return requester.get<clientMinVersionModel>(`/api/Versions/check`);
}
