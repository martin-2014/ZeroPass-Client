import { getPersonalFavouriteItems } from '@/services/api/vaultItems';
import { filterData } from '@/utils/tools';
import { FormattedMessage } from 'umi';
import AppList from '../components/AppList';
import { EditForm } from '../components/PersonalForm';
import { ListContexProvider } from '@/pages/Home/Context/ListContext';
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
            <AppList
                {...props}
                EditForm={EditForm}
                title={<FormattedMessage id="vault.home.title.favourites" />}
            />
        </ListContexProvider>
    );
};
