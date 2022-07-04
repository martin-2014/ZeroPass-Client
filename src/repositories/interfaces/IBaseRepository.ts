import { RecordEntity } from "../entities";
import { AbstractIteratorOptions } from "abstract-level";

export interface IBaseRepository<T extends RecordEntity> {
    save: (entity: T) => Promise<void>;
    del: (id: string) => Promise<void>;
    getIterator: (
        precate?: (entity: T) => boolean,
        options?: AbstractIteratorOptions<string, string>
    ) => AsyncGenerator<[string, T], void, unknown>;
    get: (id: string) => Promise<T>;
    filter: (
        precate?: (entity: T) => boolean,
        options?: AbstractIteratorOptions<string, string>
    ) => Promise<T[]>;
    getMany: (
        ids: string[],
        predicate?: (entity: T) => boolean
    ) => Promise<T[]>;
    batchSave: (entities: T[]) => Promise<void>;
    batchOperation: (
        operation: (entitis: T[]) => Promise<void>,
        size?: number
    ) => Promise<void>;
}
