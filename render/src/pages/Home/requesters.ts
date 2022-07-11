import { Result } from '../../services/api/requester';
import {
    createPersonalItem,
    deletePersonalItem,
    favouritePersonalItem,
    favouriteWorkItem,
    unfavouritePersonalItem,
    unfavouriteWorkItem,
    updatePersonalItem,
    patchPersonalItem,
    updateWorkItem,
    updateWorkItemAlias,
    updateWorkItemUsing,
    deletePersonalLogin,
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
    work: {
        updateAlias: (payload: any) => Promise<Result<any>>;
        update: (payload: any) => Promise<Result<any>>;
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
    work: {
        updateAlias: updateWorkItemAlias,
        update: updateWorkItem,
        favourite: favouriteWorkItem,
        unfavourite: unfavouriteWorkItem,
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
    work: {
        updateAlias: updateWorkItemAlias,
        update: updateWorkItem,
        favourite: favouriteWorkItem,
        unfavourite: unfavouriteWorkItem,
    },
};
