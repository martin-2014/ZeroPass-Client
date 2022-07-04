import moment from 'moment';
import { useModel } from 'umi';
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

export function getLocalTimeZone(): string {
    let timezone_offset_min = new Date().getTimezoneOffset(),
        offset_hrs = parseInt(Math.abs(timezone_offset_min / 60)),
        offset_min = Math.abs(timezone_offset_min % 60);

    let offset_hrs_string = offset_hrs.toString(),
        offset_min_string = offset_min.toString();
    if (offset_hrs < 10) offset_hrs_string = '0' + offset_hrs;
    if (offset_min < 10) offset_min_string = '0' + offset_min;

    // Add an opposite sign to the offset
    // If offset is 0, it means timezone is UTC
    let timezone_standard: string = '';
    if (timezone_offset_min < 0)
        timezone_standard = '+' + offset_hrs_string + ':' + offset_min_string;
    else if (timezone_offset_min > 0)
        timezone_standard = '-' + offset_hrs_string + ':' + offset_min_string;
    else if (timezone_offset_min == 0) timezone_standard = 'Z';

    return timezone_standard;
}

export function useLocalTime() {
    const { initialState } = useModel('@@initialState');
    return function (datetime: string) {
        const userProfile = initialState?.currentUser!;
        return `${moment
            .utc(datetime)
            .zone(getLocalTimeZone())
            .format(dateTimeFormat)} (GMT${getLocalTimeZone()})`;
    };
}

export function useLocalTimeSimple() {
    const { initialState } = useModel('@@initialState');
    return function (datetime: string) {
        const userProfile = initialState?.currentUser!;
        return `${moment.utc(datetime).zone(getLocalTimeZone()).format(dateTimeFormat)}`;
    };
}
