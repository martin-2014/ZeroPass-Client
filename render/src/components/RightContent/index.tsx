import React from 'react';
import { history, useModel } from 'umi';
import NoticeIconView from '../NoticeIcon';
import Tip from '../Tip';
import Help from './Help';
import styles from './index.less';
import MinMaxToolBar from './MinMaxToolBar';

const GlobalHeaderRight: React.FC = () => {
    if (window.electron) {
        window.electron.initLogout(() => {
            history.push('/user/logout');
        });
    }

    const { initialState } = useModel('@@initialState');
    if (!initialState || !initialState.settings) {
        return null;
    }

    return (
        <div className={styles.base}>
            <Tip />
            <div className={styles.controlContainter}>
                <div className={styles.info}>
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
