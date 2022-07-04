import { FormattedMessage } from 'umi';
import pattern from './pattern';

export const required = {
    required: true,
    message: <FormattedMessage id="Please input" />,
};

export const requiredSelect = {
    required: true,
    message: <FormattedMessage id="Please select" />,
};

export const limit32 = {
    max: 32,
    message: <FormattedMessage id="limit.max.32" />,
};

export const limit50 = {
    max: 50,
    message: <FormattedMessage id="limit.max.50" />,
};

export const limit64 = {
    max: 64,
    message: <FormattedMessage id="limit.max.64" />,
};

export const limit128 = {
    max: 128,
    message: <FormattedMessage id="limit.max.128" />,
};

export const limit255 = {
    max: 255,
    message: <FormattedMessage id="limit.max.255" />,
};

export const commonChar = {
    pattern: pattern.domain,
    message: <FormattedMessage id="register.domain.pattern.error" />,
};

export const noBlank = {
    pattern: pattern.nonBlankChars,
    message: <FormattedMessage id="common.emptyCharacters" />,
};

export const phoneFormat = {
    pattern: pattern.phone,
    message: <FormattedMessage id="register.phone.pattern.error" />,
};
