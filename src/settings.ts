import settings from "electron-settings";

interface ISettings {
    getLocale: () => Promise<string>;
    setLocale: (lng: string) => Promise<void>;
}

const localeKey = "i18nLng";

const Settings: ISettings = {
    getLocale: async () => {
        let lng = await settings.get(localeKey);
        return (lng as string) ?? "en-US";
    },

    setLocale: async (lng: string) => {
        await settings.set(localeKey, lng);
    },
};

export default Settings;
