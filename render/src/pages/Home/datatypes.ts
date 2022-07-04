import { Item as ListItem } from '@/components/HubList';
import { VaultItemView } from '@/services/api/vaultItems';

export type VaultItem = VaultItemView<any> & { isDomainItem?: boolean; assignable?: boolean } & {
    fav?: boolean;
};

export type Item = ListItem<VaultItem>;

export type TagOption = {
    id?: string | number;
    value: string;
};
