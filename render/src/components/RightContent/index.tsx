import React, { useEffect, useState } from 'react';
import { history, useModel, useIntl } from 'umi';
import NoticeIconView from '../NoticeIcon';
import SwitchIcon from '../SwitchIcon';
import Tip from '../Tip';
import Help from './Help';
import styles from './index.less';
import MinMaxToolBar from './MinMaxToolBar';
import DomainSwitchMenu from './DomainIconMenu';
import { switchDomain } from '@/services/api/user';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { localStore, sessionStore } from '@/browserStore/store';
import useInitData from '@/hooks/useInitData';
import SyncDialogIcon from '../SyncIcon';
import { checkIsMerging, mergeData } from '@/services/api/synchronization';
import { promiseDelay } from '@/utils/tools';

const GlobalHeaderRight: React.FC = () => {
    const intl = useIntl();
    const [menuVisible, setMenuVisible] = useState(false);
    const { initDataWhenSwitch } = useInitData();
    if (window.electron) {
        window.electron.initLogout(() => {
            history.push('/user/logout');
        });
    }

    const defaultCompanyRoute = '/workassigned/menus/quickerfinder/favourites';
    const defaultPersonalRoute = '/personal/menus/quickerfinder/favourites';
    const { initialState } = useModel('@@initialState');
    const domains = initialState?.currentUser?.domains.filter(
        (v) => v.domainId != initialState.currentUser?.domainId,
    );
    const isCompany = history.location.pathname.indexOf('workassigned') > -1;
    if (!initialState || !initialState.settings) {
        return null;
    }

    const { navTheme, layout } = initialState.settings;
    let className = styles.right;

    if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
        className = `${styles.right}  ${styles.dark}`;
    }
    const checked = history.location.pathname.indexOf('workassigned') > -1;
    const handleSwitchToCompany = () => {
        if (checked) {
            return;
        }
        history.push(defaultCompanyRoute);
    };
    const handleSwitchToPersonal = () => {
        if (!checked) {
            return;
        }
        history.push(defaultPersonalRoute);
    };

    const syncData = async () => {
        const firstDelay = 10000;
        const loopDelay = 1000 * 60 * 3;
        const scheduledDelay = 1000 * 60 * 30;
        let delay = firstDelay;
        sessionStore.nextSyncTime = Date.now() + firstDelay;
        await promiseDelay(firstDelay);
        while ((initialState?.currentUser?.id ?? 0) > 0) {
            const syncConfig = initialState?.currentUser?.setting?.sync;
            if (!syncConfig?.enable) {
                await promiseDelay(1000);
                continue;
            }

            const merging = await checkIsMerging();
            if (merging.fail || merging.payload) {
                await promiseDelay(1000);
                continue;
            }

            const res = await mergeData({
                id: initialState!.currentUser!.id,
                type: syncConfig!.type as Message.SyncType,
                method: 'schedule',
            });
            if (res.errorId) {
                sessionStore.nextSyncTime = Date.now() + loopDelay;
                delay = loopDelay;
            } else {
                sessionStore.nextSyncTime = Date.now() + scheduledDelay;
                delay = scheduledDelay;
            }
            await promiseDelay(delay);
        }
    };

    useEffect(() => {
        syncData();
    }, []);

    const onSwitchDomain = async (id: number) => {
        setMenuVisible(false);
        const res = await switchDomain(id);
        if (!res.fail) {
            var cryptoService = new TCryptoService();
            await cryptoService.removeEnterpriseDataKeyCache();
            sessionStore.token = res.payload.token;
            localStore.currentDomainId = id;
            await initDataWhenSwitch(sessionStore.token);
            await cryptoService.preCacheDataKey(false);
            history.push(defaultPersonalRoute);
            history.replace(defaultCompanyRoute);
        }
    };
    const switchIcon =
        domains && domains.length && isCompany ? (
            <DomainSwitchMenu domains={domains} onSwitch={onSwitchDomain} />
        ) : undefined;
    return (
        <div className={styles.base}>
            <Tip />
            <div className={styles.controlContainter}>
                <SwitchIcon
                    setMenuVisible={(e) => {
                        setMenuVisible(e);
                    }}
                    menuVisible={menuVisible}
                    overlay={switchIcon}
                    onChange={(checked) => {
                        checked ? handleSwitchToCompany() : handleSwitchToPersonal();
                    }}
                    checked={checked}
                    text={[
                        initialState.currentUser?.domainName || '',
                        intl.formatMessage({ id: 'menu.personal' }),
                    ]}
                    style={{
                        marginRight: 20,
                        display:
                            initialState.currentUser?.domainId && !initialState.currentUser?.isOwner
                                ? ''
                                : 'none',
                    }}
                ></SwitchIcon>
                <div className={styles.info}>
                    {initialState.currentUser?.setting?.sync?.enable ? (
                        <div className={styles.iconContainter}>
                            <SyncDialogIcon />
                        </div>
                    ) : (
                        <></>
                    )}

                    {initialState.currentUser ? (
                        <div className={styles.iconContainter}>
                            <NoticeIconView></NoticeIconView>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className={styles.iconContainter}>
                        <Help />
                    </div>
                </div>
            </div>
            <div className={styles.toolbarWrapper}>
                <MinMaxToolBar></MinMaxToolBar>
            </div>
        </div>
    );
};
export default GlobalHeaderRight;
