import { sessionStore } from '@/browserStore/store';
import { useModel } from 'umi';
import useTagList from './useTagList';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';

export default () => {
    const { setInitialState } = useModel('@@initialState');
    const { setSuperStatus } = useModel('superBrowser');
    const { setTags } = useModel('tags');
    const { clearPersonalTagMenuCache, clearWorkAssignedTagMenuCache } = useTagList();

    const cleanDataWhenLogout = async () => {
        setSuperStatus({});
        setInitialState((s) => ({ ...s!, currentUser: undefined }));
        sessionStore.token = '';
        var cryptoService = new TCryptoService();
        cryptoService.logout();
        clearPersonalTagMenuCache();
        clearWorkAssignedTagMenuCache();
        setTags(undefined);
        if (window.freshToken) {
            clearTimeout(window.freshToken);
            window.freshToken = null;
        }
        if (window.syncDataTimer) {
            clearTimeout(window.syncDataTimer);
            window.syncDataTimer = null;
        }
        if (window.freshPriceTokenTimeout) {
            clearTimeout(window.freshPriceTokenTimeout);
            window.freshPriceTokenTimeout = null;
        }
        if (window.electron) {
            const msg: Message.ExtensionsMessage = {
                type: 'ReturnUserProfileFromApp',
                message: {},
                errorId: '0',
            };
            electron.sendUserProfile(msg);
        }
    };

    const cleanDataWhenSwitch = async () => {
        setInitialState((s) => ({ ...s!, currentUser: undefined }));
        clearWorkAssignedTagMenuCache();
        setTags(undefined);
    };
    return {
        cleanDataWhenLogout,
        cleanDataWhenSwitch,
    };
};
