import { Level } from "level";
import { VaultItemEntity, VaultItemType } from "../entities";
import { IVaultItemRepository } from "../interfaces";
import { BaseRepository } from "./BaseRepository";

export class VaultItemRepositoryLevel
    extends BaseRepository<VaultItemEntity>
    implements IVaultItemRepository
{
    constructor(db: Level) {
        super(db, "vaultItem");
    }

    async getAll(): Promise<VaultItemEntity[]> {
        const result: VaultItemEntity[] = [];
        for await (const [key, entity] of this.getIterator(
            (entity) => entity.isDeleted === false
        )) {
            result.push(entity);
        }
        return result;
    }

    async findById(id: string): Promise<VaultItemEntity> {
        return await this.get(id);
    }

    async update(item: VaultItemEntity): Promise<VaultItemEntity> {
        await this.save(item);
        return item;
    }

    async create(item: VaultItemEntity): Promise<VaultItemEntity> {
        await this.save(item);
        return item;
    }

    async delete(id: string): Promise<boolean> {
        const entity = await this.findById(id);
        if (entity) {
            entity.isDeleted = true;
            await this.save(entity);
            return true;
        }
        return false;
    }

    async getTags(): Promise<string[]> {
        const result = new Set<string>();
        for await (const [key, entity] of this.getIterator(
            (entity) => entity.isDeleted === false
        )) {
            entity.tags.forEach((t) => {
                result.add(t);
            });
        }
        return Array.from(result);
    }

    async favorite(id: string, fav: boolean): Promise<void> {
        for await (const [key, entity] of this.getIterator(
            (entity) => !entity.isDeleted && entity.id === id,
            { gte: id }
        )) {
            entity.star = fav;
            await this.save(entity);
            return;
        }
    }

    async getItemsByType(types: VaultItemType[]): Promise<VaultItemEntity[]> {
        const result: VaultItemEntity[] = [];
        for await (const [key, entity] of this.getIterator(
            (entity) => !entity.isDeleted && types.includes(entity.type)
        )) {
            result.push(entity);
        }
        return result;
    }

    async getItemsByTag(tag: string): Promise<VaultItemEntity[]> {
        const result: VaultItemEntity[] = [];
        for await (const [key, entity] of this.getIterator(
            (entity) => !entity.isDeleted && entity.tags.includes(tag)
        )) {
            result.push(entity);
        }
        return result;
    }

    async getFavoriteItems(): Promise<VaultItemEntity[]> {
        const result: VaultItemEntity[] = [];
        for await (const [key, entity] of this.getIterator(
            (entity) => !entity.isDeleted && entity.star
        )) {
            result.push(entity);
        }
        return result;
    }
}
