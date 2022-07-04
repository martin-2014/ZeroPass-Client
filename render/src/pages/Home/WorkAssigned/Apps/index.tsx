import { getWorkLogins } from '@/services/api/logins';
import { useEffect } from 'react';
import { FormattedMessage } from 'umi';
import AppList from '../../components/AppList';
import { ListContexProvider } from '../../Context/ListContext';
import { loginRequesters } from '../../requesters';
import useTagList from '@/hooks/useTagList';

const requesters = {
    ...loginRequesters,
    load: getWorkLogins,
};

export default (props: any) => {
    const { setNewTag } = useTagList();
    useEffect(() => {
        setNewTag('workassigned');
    }, []);
    return (
        <ListContexProvider requesters={requesters} containsWork={true}>
            <AppList {...props} title={<FormattedMessage id="vault.home.title.logins" />} />
        </ListContexProvider>
    );
};
