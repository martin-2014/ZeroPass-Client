import styles from './index.less';
import Sign from '../../Sign';
import { useState } from 'react';
import { useModel } from 'umi';

export default (props: any) => {
    const [showOverflow, setShowOverflow] = useState(false);
    const { initialState } = useModel('@@initialState');

    return (
        <div className={`${styles.menuContainer} ${styles.menu}`}>
            <div
                className={styles.content}
                style={{ overflowY: showOverflow ? 'auto' : 'hidden', overflowX: 'hidden' }}
                onMouseEnter={() => setShowOverflow(true)}
                onMouseLeave={() => setShowOverflow(false)}
            >
                {props.children}
            </div>
            {initialState?.isRoleState ? <Sign /> : <></>}
        </div>
    );
};
