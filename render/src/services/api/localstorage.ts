export const storage = {
    set: <T>(key: string, value: T) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: <T>(key: string): T | null => {
        var value = localStorage.getItem(key);
        return value && JSON.parse(value);
    },
};
