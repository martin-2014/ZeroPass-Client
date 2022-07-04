import hubmessage from '@/components/HubMessage';
import { getIntl } from 'umi';

declare type ConfigDuration = number;
declare type MessageNode = React.ReactNode;
declare type MessageIntlId = string | number | undefined;

const intl = (id: MessageIntlId) => {
    return getIntl().formatMessage({ id: id });
};

interface IHubMessage {
    errorIntl: (err: MessageIntlId, zindex?: number, duration?: ConfigDuration) => void;
    infoIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration) => void;
    warnIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration) => void;
    warningIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration) => void;
    successIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration) => void;
    error: (err: MessageNode, zindex?: number, duration?: ConfigDuration) => void;
    info: (msg: MessageNode, zindex?: number, duration?: ConfigDuration) => void;
    warn: (msg: MessageNode, zindex?: number, duration?: ConfigDuration) => void;
    warning: (msg: MessageNode, zindex?: number, duration?: ConfigDuration) => void;
    success: (msg: MessageNode, zindex?: number, duration?: ConfigDuration) => void;
}

const _default: IHubMessage = {
    errorIntl: (err: MessageIntlId, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.error(intl(err), zindex, duration);
    },
    infoIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.info(intl(msg), zindex, duration);
    },
    warnIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.warn(intl(msg), zindex, duration);
    },
    warningIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.warning(intl(msg), zindex, duration);
    },
    successIntl: (msg: MessageIntlId, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.success(intl(msg), zindex, duration);
    },
    error: (err: MessageNode, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.error(err, zindex, duration);
    },
    info: (msg: MessageNode, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.info(msg, zindex, duration);
    },
    warn: (msg: MessageNode, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.warn(msg, zindex, duration);
    },
    warning: (msg: MessageNode, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.warning(msg, zindex, duration);
    },
    success: (msg: MessageNode, zindex?: number, duration?: ConfigDuration): void => {
        hubmessage.success(msg, zindex, duration);
    },
};

export default _default;
