import { Result } from '../../services/api/requester';
import {
    createPersonalItem,
    deletePersonalItem,
    deletePersonalLogin,
    favouritePersonalItem,
    patchPersonalItem,
    unfavouritePersonalItem,
    updatePersonalItem,
    updateWorkItemUsing,
    importPersonalItems,
} from '../../services/api/vaultItems';
import { VaultItem } from './datatypes';

export type ItemRequesters = {
    load: () => Promise<Result<VaultItem[]>>;
    personal: {
        create: (payload: any) => Promise<Result<any>>;
        import: (payload: any) => Promise<Result<any>>;
        update: (payload: any) => Promise<Result<any>>;
        patch: (payload: any) => Promise<Result<any>>;
        delete: (payload: any) => Promise<Result<any>>;
        favourite: (payload: any) => Promise<Result<any>>;
        unfavourite: (payload: any) => Promise<Result<any>>;
    };
};

export const loginRequesters: ItemRequesters = {
    load: () => Promise.reject('load request is not provied'),
    personal: {
        create: createPersonalItem,
        import: importPersonalItems,
        update: updatePersonalItem,
        patch: updateWorkItemUsing,
        delete: deletePersonalLogin,
        favourite: favouritePersonalItem,
        unfavourite: unfavouritePersonalItem,
    },
};

export const itemRequesters: ItemRequesters = {
    load: () => Promise.reject('load request is not provied'),
    personal: {
        create: createPersonalItem,
        import: importPersonalItems,
        update: updatePersonalItem,
        patch: patchPersonalItem,
        delete: deletePersonalItem,
        favourite: favouritePersonalItem,
        unfavourite: unfavouritePersonalItem,
    },
};
