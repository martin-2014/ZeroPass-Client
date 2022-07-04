import { Level } from "level";
import { PasswordHistoryEntity } from "../entities";
import { IPasswordHistoryRepository } from "../interfaces";
import { BaseRepository } from "./BaseRepository";

export class PasswordHistoryRepository
    extends BaseRepository<PasswordHistoryEntity>
    implements IPasswordHistoryRepository
{
    constructor(db: Level) {
        super(db, "passwordHistory");
    }
    async delete(id: string): Promise<void> {
        const entity = await this.get(id);
        if (entity) {
            entity.isDeleted = true;
            await this.save(entity);
        }
    }

    async deleteAll(): Promise<void> {
        for await (const [key, entity] of this.getIterator(
            (entity) => !entity.isDeleted
        )) {
            entity.isDeleted = true;
            this.save(entity);
        }
    }

    async create(
        entity: PasswordHistoryEntity
    ): Promise<PasswordHistoryEntity> {
        this.save(entity);
        return entity;
    }

    async list(): Promise<PasswordHistoryEntity[]> {
        const result: PasswordHistoryEntity[] = [];
        for await (const [key, entity] of this.getIterator(
            (entity) => !entity.isDeleted
        )) {
            result.push(entity);
        }
        return result;
    }
}
