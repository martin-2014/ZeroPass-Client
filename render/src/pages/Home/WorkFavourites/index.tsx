import { getWorkFavouriteItems, updateWorkItemUsing, VaultItem } from '@/services/api/vaultItems';
import { filterData } from '@/utils/tools';
import { FormattedMessage } from 'umi';
import AppList from '../components/AppList';
import { ListContexProvider } from '../Context/ListContext';
import { itemRequesters } from '../requesters';
import { localStore } from '@/browserStore/store';
import { cloneDeep } from 'lodash';

const requesters = {
    ...itemRequesters,
    load: async () => {
        const personalDomainId = localStore.personalDomainId;
        const res = await getWorkFavouriteItems();
        let result: { fail: boolean; payload?: VaultItem[]; errorId?: string };
        if (!res.fail) {
            result = cloneDeep(res);
            result.payload = res.payload?.filter((item) => item.domainId !== personalDomainId);
        } else {
            result = res;
        }
        return result;
    },
    personal: { ...itemRequesters.personal, patch: updateWorkItemUsing },
};

export default (props: any) => {
    return (
        <ListContexProvider
            containsWork={true}
            requesters={requesters}
            filter={(items, search) => {
                return filterData(items, ['description', 'title'], search).filter(
                    (item) => item.fav === true,
                );
            }}
        >
            <AppList {...props} title={<FormattedMessage id="vault.home.title.favourites" />} />
        </ListContexProvider>
    );
};
