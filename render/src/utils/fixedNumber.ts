import { FixedNumber } from 'ethers';

export const sumValues = (values: (FixedNumber | null)[]) => {
    return values
        .filter((v) => v !== null)
        .reduce((pre, cur) => {
            return (pre ?? FixedNumber.from(0)).addUnsafe(cur!);
        }, null);
};

export const fixedNumberSorter = (a: FixedNumber | null, b: FixedNumber | null) => {
    if (a === null && b === null) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    return a.subUnsafe(b).toUnsafeFloat();
};
