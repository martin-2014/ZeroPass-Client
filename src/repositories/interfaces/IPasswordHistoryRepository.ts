import { PasswordHistoryEntity } from "../entities";

export interface IPasswordHistoryRepository {
    delete: (id: string) => Promise<void>;
    deleteAll: () => Promise<void>;
    create: (entity: PasswordHistoryEntity) => Promise<PasswordHistoryEntity>;
    list: () => Promise<PasswordHistoryEntity[]>;
}
