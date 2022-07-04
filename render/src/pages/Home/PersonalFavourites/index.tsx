import { getPersonalFavouriteItems } from '@/services/api/vaultItems';
import { filterData } from '@/utils/tools';
import { FormattedMessage } from 'umi';
import AppList from '../components/AppList';
import { ListContexProvider } from '../Context/ListContext';
import { itemRequesters } from '../requesters';

const requesters = {
    ...itemRequesters,
    load: getPersonalFavouriteItems,
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
