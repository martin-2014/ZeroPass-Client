import { IAppConfigRepository } from "../interfaces";
import { AbstractSublevel } from "abstract-level";
import { Level } from "level";

type SubLevel = AbstractSublevel<
    Level<string, string>,
    string | Buffer | Uint8Array,
    string,
    string
>;

const syncDbFingerprintKey: string = "syncDbFingerprint";
const deviceIdKey: string = "deviceId";
const lastSyncStatus = "lastSyncStatus";
const lastSuccSyncInfo = "lastSuccSyncInfo";

export class AppConfigRepository implements IAppConfigRepository {
    private level: SubLevel;

    constructor(db: Level) {
        this.level = db.sublevel("appConfig");
    }

    async getDeviceId(): Promise<string> {
        return await this.getString(deviceIdKey);
    }

    async setDeviceId(id: string): Promise<void> {
        await this.setValue(deviceIdKey, id);
    }

    async getLastSyncStatus(): Promise<Message.SyncInfo> {
        return await this.getObject<Message.SyncInfo>(lastSyncStatus);
    }

    async setLastSyncStatus(info: Message.SyncInfo) {
        await this.setValue(lastSyncStatus, info);
    }

    async getSyncDbFingerprint(): Promise<string> {
        return await this.getString(syncDbFingerprintKey);
    }

    async setSyncDbFingerprint(v: string): Promise<void> {
        await this.setValue(syncDbFingerprintKey, v);
    }

    private async setValue(key: string, value: any): Promise<void> {
        await this.level.put(key, JSON.stringify(value));
    }

    private async getInt(key: string, defaultValue?: number): Promise<number> {
        const v = await this.getById<number>(key);
        if (v === undefined) {
            return defaultValue;
        } else {
            return v;
        }
    }

    private async getString(
        key: string,
        defaultValue?: string
    ): Promise<string> {
        const v = await this.getById<string>(key);
        if (v === undefined) {
            return defaultValue;
        } else {
            return v;
        }
    }

    private async getObject<T = any>(key: string): Promise<T> {
        const v = await this.getById<T>(key);
        return v;
    }

    private async getById<T = any>(key: string): Promise<T> {
        try {
            const v = await this.level.get(key);
            if (v === undefined) {
                return undefined;
            }
            const obj = JSON.parse(v);
            if (obj === undefined) {
                return undefined;
            }
            return obj as T;
        } catch (e) {
            if (e.code === "LEVEL_NOT_FOUND") {
                return undefined;
            }
            throw e;
        }
    }
}
