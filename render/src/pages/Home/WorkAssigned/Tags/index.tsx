import { getWorkItemsByTagId } from '@/services/api/vaultItems';
import { FormattedMessage } from 'umi';
import AppList from '../../components/AppList';
import { ListContexProvider } from '../../Context/ListContext';
import { loginRequesters } from '../../requesters';

const requesters = {
    ...loginRequesters,
    load: getWorkItemsByTagId,
};

export default (props: any) => {
    return (
        <ListContexProvider requesters={requesters} containsWork={true}>
            <AppList {...props} title={<FormattedMessage id="vault.home.title.logins" />} />
        </ListContexProvider>
    );
};
