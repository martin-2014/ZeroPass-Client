export const getImgUriByType = (cardType: string | undefined) => {
    const supportTypes = [
        'american-express',
        'unionpay',
        'visa',
        'diners-club',
        'discover',
        'jcb',
        'maestro',
        'mastercard',
    ];
    if (!cardType || !supportTypes.find((type) => type === cardType)) {
        return 'defaultFavicon';
    }
    return `./icons/credit-card-${cardType}.png`;
};

export const formatNumber = (number: string) => {
    if (number === undefined) return '';
    return (number.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?(\d{1,3})?/) || [])
        .slice(1)
        .filter(Boolean)
        .join(' ');
};

export const getRawNumber = (formattedNumber: string) => {
    if (formattedNumber === undefined) return '';
    return formattedNumber.replaceAll(' ', '');
};

export const getDescription = (number: string) => {
    if (number.length < 8) return '';
    return `${number.substring(0, 4)} ${'*'.repeat(4)} ${number.substring(
        number.length - 4,
        number.length,
    )}`;
};

export const FORM_ICON_SIZE = 34;
