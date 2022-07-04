import { FixedNumber } from 'ethers';

const dollarFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatCurrency = (
    value: FixedNumber | null,
    format: 'noSymbol' | 'withSymbol' = 'withSymbol',
) => {
    if (value === null) return '-';
    const formatter = format === 'withSymbol' ? dollarFormatter : currencyFormatter;
    return formatter.format(value.toUnsafeFloat());
};

export const formatFixedNumber = (value: FixedNumber | null) => {
    if (!value) return '-';
    const val = value.toString();
    if (!val.endsWith('.0')) return val;
    return val.substring(0, val.length - 2);
};
