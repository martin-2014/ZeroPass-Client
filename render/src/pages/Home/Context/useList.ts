import { syncItemListToPlugin } from '@/ipc/ipcHandler';
import { onceExecutor } from '@/services/api/requester';
import { VaultItemType } from '@/services/api/vaultItems';
import { IsPersonalItem } from '@/utils/tools';
import { useEffect, useReducer, useRef } from 'react';
import { useIntl } from 'umi';
import { Item, VaultItem } from '@/pages/Home/datatypes';
import { ItemRequesters } from '@/pages/Home/requesters';
import { getIconUri } from './ListContext';
import actions, { Action, ListState } from '@/pages/Home/Context/action';

const executor = onceExecutor();

export const sortItems = (items: Item[]) => {
    return items.sort((a, b) => {
        if (a.lastModified > b.lastModified) return -1;
        if (a.lastModified < b.lastModified) return 1;
        return a.title.localeCompare(b.title);
    });
};

export const reducer = (state: ListState, action: Action): ListState => {
    const { type, args } = action;

    const actrionFun = actions[type];
    if (actrionFun) {
        return actrionFun(state, args);
    }
    return {
        items: [],
        search: '',
        selectedId: -1,
    };
};

export type Props = ItemRequesters;

function useList(requesters: ItemRequesters) {
    const intl = useIntl();
    const [listState, dispatch] = useReducer(reducer, {
        search: '',
        selectedId: -1,
    });
    const isUnmount = useRef(false);
    useEffect(() => {
        isUnmount.current = false;
        return () => {
            isUnmount.current = true;
        };
    }, []);
    const setSearch = (search: string) => {
        dispatch({ type: 'search', args: search });
    };
    const getUTCNow = () => {
        return new Date().toISOString();
    };
    const onListChange = async (items: Item[]) => {
        syncItemListToPlugin();
    };

    const getDescription = (item: VaultItem) => {
        switch (item.type) {
            case VaultItemType.MetaMaskMnemonicPhrase:
                return intl.formatMessage({ id: 'vault.MetaMaskMnemonicPhrase.title' });
            case VaultItemType.MetaMaskRawData:
                return intl.formatMessage({ id: 'vault.metaMaskRawData.title' });
            default:
                return item.description;
        }
    };
    const load = async () => {
        const transformItem = (item: VaultItem) => {
            const icon = getIconUri(item);
            return {
                ...item,
                title: item.alias || item.name,
                description: getDescription(item),
                key: item.id.toString(),
                fav: item.star,
                isDomainItem: !IsPersonalItem(item.domainId),
                assignable: !IsPersonalItem(item.domainId) && item.canAssign,
                avatar: false,
                icon: icon,
            };
        };

        const items: Item[] = [];
        const res = await executor(() => requesters.load());
        if (res.skip || res.fail || isUnmount.current) {
            return;
        }
        res.payload!.forEach((item) => {
            items.push(transformItem(item));
        });

        dispatch({ type: 'init', args: items });

        onListChange?.(listState.items!);
    };

    const createPersonal = async (payload: any) => {
        const res = await requesters.personal.create(payload);
        if (!res.fail) {
            load();
            onListChange?.(listState.items!);
        }
        return res;
    };

    const deletePersonal = async (payload: any) => {
        const res = await requesters.personal.delete(payload);
        if (!res.fail && !isUnmount.current) {
            load();
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const updatePersonal = async (payload: any) => {
        const res = await requesters.personal.update(payload);
        if (!res.fail && !isUnmount.current) {
            load();
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const favouritePersonal = async (id: number) => {
        const res = await requesters.personal.favourite(id);
        if (!res.fail && !isUnmount.current) {
            load();
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const unfavouritePersonal = async (id: number) => {
        const res = await requesters.personal.unfavourite(id);
        if (!res.fail && !isUnmount.current) {
            load();
            onListChange?.(listState.items || []);
        }
        return res;
    };
    const setSelectedId = async (id: number | string) => {
        dispatch({ type: 'select', args: { id } });
        if (id != -1) {
            const payload = { id: id, lastUsed: getUTCNow() };
            const res = await requesters.personal.patch(payload);
            if (!res.fail && !isUnmount.current) {
                load();
            }
        }
    };
    const importPersonal = async (payload: any) => {
        const res = await requesters.personal.import(payload);
        if (!res.fail) {
            load();
            onListChange?.(listState.items!);
        }
        return res;
    };
    return {
        dispatch,
        listState,
        setSearch,
        isUnmount,
        personal: {
            create: createPersonal,
            update: updatePersonal,
            delete: deletePersonal,
            favourite: favouritePersonal,
            unfavourite: unfavouritePersonal,
            import: importPersonal,
        },
        loadItems: load,
        onListChange,
        setSelectedId,
    };
}

export default useList;
