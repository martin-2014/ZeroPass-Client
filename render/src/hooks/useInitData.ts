import { localStore } from '@/browserStore/store';
import { useModel } from 'umi';
import useTagList from './useTagList';

type TokenItem = {
    UserId: number;
    PersonalDomainId: number;
    EnterpriseDomainId: number;
    IsEnterpriseOwner: boolean;
    IsEnterpriseAdmin: boolean;
};

export default () => {
    const { initialState, setInitialState } = useModel('@@initialState');
    const { setNewTag } = useTagList();

    const tokenParse = (token: string) => {
        const payload = token.split('.')[1];
        const result: TokenItem = JSON.parse(
            window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
        );
        return result;
    };

    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo();
        if (userInfo) {
            await setInitialState((s) => ({
                ...s!,
                currentUser: userInfo,
            }));
        }
        return userInfo;
    };

    const initDataWhenLogin = async (token: string) => {
        const tokenInfo = tokenParse(token);

        localStore.currentDomainId = tokenInfo.EnterpriseDomainId;
        localStore.personalDomainId = tokenInfo.PersonalDomainId;
        localStore.lastUserId = tokenInfo.UserId;
        return await fetchUserInfo();
    };

    const initDataWhenSwitch = async (token: string) => {
        const tokenInfo = tokenParse(token);

        localStore.currentDomainId = tokenInfo.EnterpriseDomainId;
        const info = await fetchUserInfo();
        setNewTag('workassigned');
        return info;
    };

    return {
        initDataWhenLogin,
        initDataWhenSwitch,
        tokenParse,
    };
};
