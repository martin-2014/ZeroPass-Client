import { localRequester } from './requester';

export const exportData = async (params: Message.ExportParams) => {
    return await localRequester('exportData', params);
};

export const importData = async (params: Message.ImportParams) => {
    return await localRequester('importData', params);
};
