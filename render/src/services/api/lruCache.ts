interface TimestampValue {
    when: number;
}

export interface CacheValue {
    id: string;
}

type CacheItem<TValue> = TValue & TimestampValue;

export class LruCache<T extends CacheValue> {
    private ttl: number;
    private cache: Record<string, CacheItem<T>>;

    constructor(ttl: number) {
        this.ttl = ttl;
        this.cache = {};
        setInterval(this.refresh.bind(this), ttl);
    }

    refresh() {
        const values: T[] = [];
        for (let k of Object.keys(this.cache)) {
            if (this.isExpired(this.cache[k])) {
                delete this.cache[k];
            } else {
                values.push(this.cache[k]);
            }
        }
        return values;
    }

    update(value: T[] | T) {
        const now = Date.now();
        if (Array.isArray(value)) {
            value.forEach((v) => (this.cache[v.id] = { ...v, when: now }));
        } else {
            this.cache[value.id] = { ...value, when: now };
        }
    }

    private isExpired(v: TimestampValue) {
        return Date.now() - v.when > this.ttl;
    }
}
