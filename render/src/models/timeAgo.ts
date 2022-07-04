import { useEffect, useState } from 'react';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import de from 'javascript-time-ago/locale/de';
import fr from 'javascript-time-ago/locale/fr';
import it from 'javascript-time-ago/locale/it';
import es from 'javascript-time-ago/locale/es';
import pt from 'javascript-time-ago/locale/pt';
import ja from 'javascript-time-ago/locale/ja';
import ko from 'javascript-time-ago/locale/ko';
import th from 'javascript-time-ago/locale/th';
import ms from 'javascript-time-ago/locale/ms';
import vi from 'javascript-time-ago/locale/vi';
import zh from 'javascript-time-ago/locale/zh';
import zhHant from 'javascript-time-ago/locale/zh-Hant';
import { getLocale } from 'umi';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(de);
TimeAgo.addLocale(fr);
TimeAgo.addLocale(it);
TimeAgo.addLocale(es);
TimeAgo.addLocale(pt);
TimeAgo.addLocale(ja);
TimeAgo.addLocale(ko);
TimeAgo.addLocale(th);
TimeAgo.addLocale(ms);
TimeAgo.addLocale(vi);
TimeAgo.addLocale(zh);
TimeAgo.addLocale(zhHant);

export default () => {
    const [language, setLanguage] = useState(getLocale());
    const [timeAgo, setTimeAgo] = useState(new TimeAgo(language ?? 'en-US'));

    useEffect(() => {
        if (language === 'zh-TW') {
            setLanguage('zh-Hant');
        }
        const timeAgo = new TimeAgo(language);
        setTimeAgo(timeAgo);
    }, [language]);

    return { setLanguage, timeAgo };
};
