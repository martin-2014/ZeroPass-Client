import { RecordEntity, EntityType } from "../entities";
import { IBaseRepository } from "../interfaces";
import {
    AbstractIteratorOptions,
    AbstractSublevel,
    AbstractBatchOperation,
} from "abstract-level";
import { Level } from "level";

type SubLevel = AbstractSublevel<
    Level<string, string>,
    string | Buffer | Uint8Array,
    string,
    string
>;

export class BaseRepository<T extends RecordEntity>
    implements IBaseRepository<T>
{
    private level: SubLevel;
    constructor(db: Level, subType: EntityType) {
        this.level = db.sublevel(subType);
    }

    private toRecordEntity(value: string): T {
        try {
            const obj = JSON.parse(value);
            return obj as T;
        } catch {}
    }

    async get(id: string): Promise<T> {
        const value = await this.level.get(id);
        return this.toRecordEntity(value);
    }
    async save(entity: T): Promise<void> {
        await this.level.put(entity.id, JSON.stringify(entity));
    }

    async del(id: string): Promise<void> {
        await this.level.del(id);
    }

    async *getIterator(
        predicate?: (entity: T) => boolean,
        options?: AbstractIteratorOptions<string, string>
    ): AsyncGenerator<[string, T], void, unknown> {
        const iter = this.level.iterator(options);
        const self = this;
        try {
            while (true) {
                const records = await iter.nextv(100);
                if (records.length < 1) {
                    break;
                }
                for (const [key, value] of records) {
                    const entity = self.toRecordEntity(value);
                    if (entity === undefined) {
                        continue;
                    }
                    if (predicate !== undefined) {
                        if (!predicate(entity)) {
                            continue;
                        }
                    }
                    yield [key, entity];
                }
            }
        } catch (e) {
            throw e;
        } finally {
            iter.close();
        }
    }

    async filter(
        predicate?: (entity: T) => boolean,
        options?: AbstractIteratorOptions<string, string>
    ): Promise<T[]> {
        const iter = this.level.iterator(options);
        const result: T[] = [];
        try {
            while (true) {
                const records = await iter.nextv(100);
                if (records.length < 1) {
                    break;
                }
                for (const [key, value] of records) {
                    const entity = this.toRecordEntity(value);
                    if (entity === undefined) {
                        continue;
                    }
                    if (predicate !== undefined) {
                        if (!predicate(entity)) {
                            continue;
                        }
                    }
                    result.push(entity);
                }
            }
        } catch (e) {
            throw e;
        } finally {
            iter.close();
        }
        return result;
    }

    async getMany(
        ids: string[],
        predicate?: (entity: T) => boolean
    ): Promise<T[]> {
        const values = await this.level.getMany(ids);
        const entities = values
            .map((v) => this.toRecordEntity(v))
            .filter((e) => e !== undefined);
        if (predicate != undefined) {
            return entities.filter(predicate);
        }
        {
            return entities;
        }
    }

    async batchSave(entities: T[]): Promise<void> {
        const opts = entities.map((e) => {
            const item: AbstractBatchOperation<SubLevel, string, string> = {
                type: "put",
                key: e.id,
                value: JSON.stringify(e),
            };
            return item;
        });
        await this.level.batch(opts);
    }

    async batchOperation(
        operation: (entitis: T[]) => Promise<void>,
        size?: number
    ): Promise<void> {
        if (size === undefined) {
            size = 100;
        }
        const self = this;
        const iter = this.level.iterator();
        try {
            while (true) {
                const records = await iter.nextv(size);
                if (records.length < 1) {
                    break;
                }
                await operation(
                    records
                        .map((record) => {
                            const [key, value] = record;
                            return self.toRecordEntity(value);
                        })
                        .filter((e) => e !== undefined)
                );
            }
        } catch (e) {
            throw e;
        } finally {
            iter.close();
        }
    }
}
