import Image from '@/components/Image';
import { itemRequesters, ItemRequesters } from '@/pages/Home/requesters';
import { createContext, PropsWithChildren } from 'react';
import { filterData, getFaviconUrl } from '../../..//utils/tools';
import { Result } from '@/services/api/requester';
import { VaultItemType } from '@/services/api/vaultItems';
import IconMap from '@/pages/Home/components/IconMap';
import { Item, VaultItem } from '../datatypes';
import { getImgUriByType } from '../tools';
import useList from './useList';

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
        import: (payload: Message.VaultItem[]) => Promise<Result<any>>;
        update: (payload: Message.VaultItem) => Promise<Result<any>>;
        delete: (payload: any) => Promise<Result<any>>;
        favourite: (payload: any) => Promise<Result<any>>;
        unfavourite: (payload: any) => Promise<Result<any>>;
    };
};

export const initialContext: ListContextType = {
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
    const {
        requesters,
        children,
        filter = (items, search) => {
            return filterData(items, ['description', 'title'], search);
        },
    } = props;
    const { listState, dispatch, ...rest } = useList(requesters);
    return (
        <ListContext.Provider
            value={{
                items: filter(listState.items || [], listState.search),
                selectedId: listState.selectedId,
                selectedItem: listState.items?.find((item) => item.id == listState.selectedId),
                ...rest,
            }}
        >
            {children}
        </ListContext.Provider>
    );
};
