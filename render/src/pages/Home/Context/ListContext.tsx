import { localStore } from '@/browserStore/store';
import { PersonalVaultItem } from '@/services/api/logins';
import { onceExecutor, Result } from '@/services/api/requester';
import { VaultItemType } from '@/services/api/vaultItems';
import { filterData, getFaviconUrl, IsPersonalItem } from '@/utils/tools';
import { createContext, PropsWithChildren, useReducer, useEffect, useRef } from 'react';
import { Item, VaultItem } from '../datatypes';
import { itemRequesters, ItemRequesters } from '../requesters';
import { syncItemListToPlugin } from '@/ipc/ipcHandler';
import { getImgUriByType } from '../tools';
import { useIntl } from 'umi';
import IconMap from '../components/IconMap';
import Image from '@/components/Image';

const executor = onceExecutor();

export type Action = {
    type: 'create' | 'delete' | 'update' | 'init' | 'search' | 'changeAlias' | 'select';
    args?: any;
};

export type ListState = {
    items?: Item[];
    search: string;
    selectedId: number;
};

export const reducer = (state: ListState, action: Action): ListState => {
    const { items, selectedId } = state;
    const { type, args } = action;

    const updateItem = (value: any) => {
        return {
            ...state,
            items: sortItems(
                items!.map((item) => (item.id == value.id ? { ...item, ...value } : item)),
            ),
        };
    };

    const deleteItem = (id: number): ListState => {
        return {
            ...state,
            items: items!.filter((item) => item.id !== id),
            selectedId: id === selectedId ? -1 : selectedId,
        };
    };

    const sortItems = (items: Item[]) => {
        return items.sort((a, b) => {
            if (a.lastModified > b.lastModified) return -1;
            if (a.lastModified < b.lastModified) return 1;
            return a.title.localeCompare(b.title);
        });
    };

    switch (type) {
        case 'init':
            return { ...state, items: sortItems(args) };
        case 'update':
            return updateItem(args);
        case 'create':
            return { ...state, items: sortItems([...(items || []), args]) };
        case 'delete':
            return deleteItem(args as number);
        case 'search':
            return { ...state, search: args };
        case 'select':
            return { ...state, selectedId: args.id };
        default:
            return {
                items: [],
                search: '',
                selectedId: -1,
            };
    }
};

type ValutItemGetRequester = () => Promise<Result<PersonalVaultItem[]>>;
const size = 24;
export const itemTypeIconMap = new Map<VaultItemType, JSX.Element>([
    [VaultItemType.SecureNodes, IconMap(VaultItemType.SecureNodes, size)],
    [VaultItemType.PersonalInfo, IconMap(VaultItemType.PersonalInfo, size)],
    [VaultItemType.MetaMaskMnemonicPhrase, IconMap(VaultItemType.MetaMaskMnemonicPhrase, size)],
    [VaultItemType.MetaMaskRawData, IconMap(VaultItemType.MetaMaskRawData, size)],
    [VaultItemType.Addresses, IconMap(VaultItemType.Addresses, size)],
]);

export const getIconUri = (item: VaultItem) => {
    switch (item.type) {
        case VaultItemType.SecureNodes:
        case VaultItemType.PersonalInfo:
        case VaultItemType.MetaMaskMnemonicPhrase:
        case VaultItemType.MetaMaskRawData:
        case VaultItemType.Addresses:
            return itemTypeIconMap.get(item.type);
        case VaultItemType.Login:
            const loginUri = item.detail.loginUri;
            const url = getFaviconUrl(loginUri);
            return <Image defaulticon={IconMap(VaultItemType.Login, size)} src={url} />;
        case VaultItemType.CreditCard: {
            const icon = getImgUriByType(item.detail.cardType);
            return <Image defaulticon={IconMap(VaultItemType.CreditCard, size)} src={icon} />;
        }

        default:
            return <></>;
    }
};

export type ListContextType = {
    items: Item[];
    selectedId: number;
    setSelectedId: (id: number | string) => void;
    selectedItem?: Item;
    setSearch: (search: string) => void;
    loadItems: (args?: any) => Promise<void>;
    personal: {
        create: (payload: Message.VaultItem) => Promise<Result<any>>;
        update: (payload: Message.VaultItem) => Promise<Result<any>>;
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

const initialContext: ListContextType = {
    items: [],
    setSearch: (_: string) => {},
    selectedId: -1,
    setSelectedId: (_: number | string) => {},
    ...itemRequesters,
    loadItems: () => Promise.resolve(),
};

export const ListContext = createContext<ListContextType>(initialContext);

export const ListContexProvider = (
    props: PropsWithChildren<{
        requesters: ItemRequesters;
        containsWork?: boolean;
        filter?: (items: Item[], search: string) => Item[];
    }>,
) => {
    const intl = useIntl();
    const isUnmount = useRef(false);
    useEffect(() => {
        isUnmount.current = false;
        return () => {
            isUnmount.current = true;
        };
    }, []);
    const {
        requesters,
        children,
        containsWork = false,
        filter = (items, search) => {
            return filterData(items, ['description', 'title'], search);
        },
    } = props;

    const onListChange = async (items: Item[]) => {
        syncItemListToPlugin();
    };

    const [listState, dispatch] = useReducer(reducer, {
        search: '',
        selectedId: -1,
    });

    const setSearch = (search: string) => {
        dispatch({ type: 'search', args: search });
    };

    const getUTCNow = () => {
        return new Date().toISOString();
    };

    const setSelectedId = async (id: number | string) => {
        dispatch({ type: 'select', args: { id } });
        if (id != -1) {
            const payload = { id: id, lastUsed: getUTCNow() };
            const res = await requesters.personal.patch(payload);
            if (!res.fail && !isUnmount.current) {
                dispatch({
                    type: 'update',
                    args: {
                        ...payload,
                    },
                });
            }
        }
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

    const load = async (requester: ValutItemGetRequester) => {
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
        const res = await executor(requester);
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
        const item = {
            ...payload,
            domainId: localStore.personalDomainId,
            id: res.payload.id,
            key: res.payload.id?.toString(),
            title: payload.name,
            isDomainItem: false,
            assignable: false,
            star: false,
            fav: false,
            avatar: false,
            tags: res.payload.tags,
        };
        if (!res.fail) {
            const icon = getIconUri(item);
            dispatch({
                type: 'create',
                args: {
                    ...item,
                    lastModified: new Date().toISOString().substring(0, 19),
                    lastUsed: getUTCNow(),
                    description: getDescription(payload),
                    icon,
                },
            });
            onListChange?.(listState.items!);
        }
        return res;
    };

    const deletePersonal = async (payload: any) => {
        const res = await requesters.personal.delete(payload);
        if (!res.fail && !isUnmount.current) {
            dispatch({ type: 'delete', args: payload });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const updatePersonal = async (payload: any) => {
        const res = await requesters.personal.update(payload);
        if (!res.fail && !isUnmount.current) {
            dispatch({
                type: 'update',
                args: {
                    ...payload,
                    title: payload.name,
                    icon: getIconUri(payload),
                    lastModified: new Date().toISOString().substring(0, 19),
                    tags: res.payload.tags,
                },
            });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const favouritePersonal = async (id: number) => {
        const res = await requesters.personal.favourite(id);
        if (!res.fail && !isUnmount.current) {
            dispatch({ type: 'update', args: { id, fav: true } });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const unfavouritePersonal = async (id: number) => {
        const res = await requesters.personal.unfavourite(id);
        if (!res.fail && !isUnmount.current) {
            dispatch({ type: 'update', args: { id, fav: false } });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const updateWorkAlias = async (payload: { alias: string }) => {
        const res = await requesters.work.updateAlias(payload);
        if (!res.fail) {
            dispatch({ type: 'update', args: { ...payload, title: payload.alias } });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const updateWork = async (payload: { alias: string }) => {
        const res = await requesters.work.update(payload);
        if (!res.fail) {
            dispatch({ type: 'update', args: { ...payload, title: payload.alias } });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const favouriteWork = async (id: number) => {
        const res = await requesters.work.favourite(id);
        if (!res.fail && !isUnmount.current) {
            dispatch({ type: 'update', args: { id, fav: true } });
            onListChange?.(listState.items || []);
        }
        return res;
    };

    const unfavouriteWork = async (id: number) => {
        const res = await requesters.work.unfavourite(id);
        if (!res.fail && !isUnmount.current) {
            dispatch({ type: 'update', args: { id, fav: false } });
            onListChange?.(listState.items || []);
        }
        return res;
    };
    return (
        <ListContext.Provider
            value={{
                items: filter(listState.items || [], listState.search),
                selectedId: listState.selectedId,
                selectedItem: listState.items?.find((item) => item.id == listState.selectedId),
                setSelectedId,
                setSearch,
                loadItems: (args: any) => load(() => requesters.load(args)),
                personal: {
                    create: createPersonal,
                    update: updatePersonal,
                    delete: deletePersonal,
                    favourite: favouritePersonal,
                    unfavourite: unfavouritePersonal,
                },
                work: {
                    updateAlias: updateWorkAlias,
                    update: updateWork,
                    favourite: favouriteWork,
                    unfavourite: unfavouriteWork,
                },
            }}
        >
            {children}
        </ListContext.Provider>
    );
};
