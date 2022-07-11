import { getPersonalItems, VaultItemType } from '@/services/api/vaultItems';
import { FormattedMessage } from 'umi';
import AppList from '../../components/AppList';
import { ListContexProvider } from '@/pages/Home/Context/ListContext';
import { itemRequesters } from '@/pages/Home/requesters';
import { EditForm } from '../../components/PersonalForm';

const requesters = {
    ...itemRequesters,
    load: () => getPersonalItems(VaultItemType.Login),
};

export default (props: any) => {
    return (
        <ListContexProvider requesters={requesters}>
            <AppList
                {...props}
                EditForm={EditForm}
                title={<FormattedMessage id="vault.home.title.logins" />}
                addableItemTypes={[VaultItemType.Login]}
                canImport={true}
                canExport={true}
            />
        </ListContexProvider>
    );
};
