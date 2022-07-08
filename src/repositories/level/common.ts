import path from "path";

const dataStoreFunc = () => {
    return {
        dbPath: (base: string) => {
            return path.join(base, "db");
        },
        dbFile: (base: string) => {
            return path.join(base, "db.7z");
        },
        walletPath: (base: string) => {
            return path.join(base, "mmbk");
        },
        packagePath: (base: string) => {
            return path.join(base, "zip");
        },
        packageFile: (base: string) => {
            return path.join(path.join(base, "zip"), "data.7z");
        },
        userInfo: (base: string) => {
            return path.join(base, "userInfo.json");
        },
    };
};

export const dataStoreUtils = dataStoreFunc();
