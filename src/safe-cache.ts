import { safeStorage } from "electron";

class TSafeCache implements SafeCache.ISafeCache {
    private readonly _cache: Map<string, Buffer>;
    constructor() {
        this._cache = new Map<string, Buffer>();
    }
    public setItem(key: string, value: string) {
        this._cache.set(key, safeStorage.encryptString(value));
    }
    public getItem(key: string): string {
        return this._cache.has(key)
            ? safeStorage.decryptString(this._cache.get(key))
            : "";
    }
    public clear() {
        this._cache.clear();
    }
}

const safeCache = new TSafeCache();
export default safeCache;
