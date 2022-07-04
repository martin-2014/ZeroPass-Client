import { getPersonalItems, VaultItemType } from '@/services/api/vaultItems';
import { FormattedMessage } from 'umi';
import AppList from '../../components/AppList';
import { ListContexProvider } from '../../Context/ListContext';
import { itemRequesters } from '../../requesters';

const requesters = {
    ...itemRequesters,
    load: () => getPersonalItems(VaultItemType.PersonalInfo),
};

export default (props: any) => {
    return (
        <ListContexProvider requesters={requesters}>
            <AppList
                {...props}
                title={<FormattedMessage id="vault.home.title.personalInfo" />}
                addableItemTypes={[VaultItemType.PersonalInfo]}
            />
        </ListContexProvider>
    );
};
