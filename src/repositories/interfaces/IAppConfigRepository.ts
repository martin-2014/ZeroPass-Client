export interface IAppConfigRepository {
    getLastSyncStatus: () => Promise<Message.SyncInfo>;
    setLastSyncStatus: (info: Message.SyncInfo) => Promise<void>;
    getSyncDbFingerprint: () => Promise<string>;
    setSyncDbFingerprint: (v: string) => Promise<void>;
    getDeviceId: () => Promise<string>;
    setDeviceId: (id: string) => Promise<void>;
}
