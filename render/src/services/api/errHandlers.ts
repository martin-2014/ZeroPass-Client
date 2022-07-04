import message from '@/utils/message';
import { IFailableResult } from './requester';

export interface ErrorHandler {
    (result: IFailableResult): void;
}

const defaultErrorHandler: ErrorHandler = (result: IFailableResult) => {
    if (result.errorId) {
        message.errorIntl(result.errorId);
    }
};

export const errHandlers = {
    default: defaultErrorHandler,
};
