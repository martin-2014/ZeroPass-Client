import { localStore } from '@/browserStore/store';
import { useModel } from 'umi';

type TokenItem = {
    UserId: number;
    PersonalDomainId: number;
    EnterpriseDomainId: number;
    IsEnterpriseOwner: boolean;
    IsEnterpriseAdmin: boolean;
};

export default () => {
    const { initialState, setInitialState } = useModel('@@initialState');

    const tokenParse = (token: string) => {
        const payload = token.split('.')[1];
        const result: TokenItem = JSON.parse(
            window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
        );
        return result;
    };

    const setCurrentUser = async (userInfo: API.UserProfile | undefined) => {
        await setInitialState((s) => ({
            ...s!,
            currentUser: userInfo,
        }));
    };

    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo();
        if (userInfo) {
            await setCurrentUser(userInfo);
        }
        return userInfo;
    };

    const initDataWhenLogin = async (token: string) => {
        const tokenInfo = tokenParse(token);

        localStore.personalDomainId = tokenInfo.PersonalDomainId;
        localStore.lastUserId = tokenInfo.UserId;
        return await fetchUserInfo();
    };

    return {
        initDataWhenLogin,
        tokenParse,
        fetchUserInfo,
        setCurrentUser,
    };
};
