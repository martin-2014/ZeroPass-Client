// @ts-ignore
/* eslint-disable */
import { requester } from './requester';

export async function getAppUsedReport() {
    return await requester.get<API.AppUsedReport[]>('/api/reports');
}
