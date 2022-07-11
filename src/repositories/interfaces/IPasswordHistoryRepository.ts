import { PasswordHistoryEntity } from "../entities";
import { IBaseRepository } from "./IBaseRepository";

export interface IPasswordHistoryRepository
    extends IBaseRepository<PasswordHistoryEntity> {
    delete: (id: string) => Promise<void>;
    deleteAll: () => Promise<void>;
    create: (entity: PasswordHistoryEntity) => Promise<PasswordHistoryEntity>;
    list: () => Promise<PasswordHistoryEntity[]>;
}
