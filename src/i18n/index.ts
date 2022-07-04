import i18n from "i18next";

import enUs from "./locales/en-US.json";
import zhCn from "./locales/zh-CN.json";
import jaJP from "./locales/ja-JP.json";
import deDE from "./locales/de-DE.json";
import esES from "./locales/es-ES.json";
import frFR from "./locales/fr-FR.json";
import itIT from "./locales/it-IT.json";
import koKR from "./locales/ko-KR.json";
import msMY from "./locales/ms-MY.json";
import ptPT from "./locales/pt-PT.json";
import thTH from "./locales/th-TH.json";
import viVN from "./locales/vi-VN.json";
import zhTW from "./locales/zh-TW.json";

const resources = {
    "en-US": {
        translation: enUs,
    },
    "zh-CN": {
        translation: zhCn,
    },
    "ja-JP": {
        translation: jaJP,
    },
    "de-DE": {
        translation: deDE,
    },
    "es-ES": {
        translation: esES,
    },
    "fr-FR": {
        translation: frFR,
    },
    "it-IT": {
        translation: itIT,
    },
    "ko-KR": {
        translation: koKR,
    },
    "ms-MY": {
        translation: msMY,
    },
    "pt-PT": {
        translation: ptPT,
    },
    "th-TH": {
        translation: thTH,
    },
    "vi-VN": {
        translation: viVN,
    },
    "zh-TW": {
        translation: zhTW,
    },
};

i18n.init({
    resources: resources,
    fallbackLng: "en-US",
});

export default i18n;
