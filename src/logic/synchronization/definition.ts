// step 1 check if need to merge
// step 2 get lock
// step 3 download file
// step 4 merge
// step 5 upload file
// step 6 free lock

interface ISyncWorkFlow {
    checkData: () => Promise<boolean>;
    getLock: () => Promise<boolean>;
    downloadFile: () => Promise<boolean>;
    mergeData: () => Promise<boolean>;
    uploadFile: () => Promise<boolean>;
    freeLock: () => Promise<boolean>;
    done: () => Promise<boolean>;
    error: () => Promise<boolean>;
    timeout: () => Promise<boolean>;
    updateLock: () => Promise<boolean>;
    startUp: () => Promise<boolean>;
    end: () => Promise<boolean>;
    message: string;
    type: string;
    method: string;
}

type SyncErrorStatus =
    | "start"
    | "getLock"
    | "downloadFile"
    | "mergeData"
    | "uploadFile"
    | "error"
    | "timeout";

type SyncStatus =
    | "normal"
    | "checkData"
    | "freeLock"
    | "done"
    | SyncErrorStatus;

export { ISyncWorkFlow, SyncStatus, SyncErrorStatus };
