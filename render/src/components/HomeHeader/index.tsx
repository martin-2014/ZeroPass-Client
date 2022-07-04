import { ReactNode } from 'react';
import styles from './index.less';

export interface HeaderProps {
    title: ReactNode;
}

export default (props: HeaderProps) => {
    return (
        <div className={styles.headerWrapper}>
            <div className={styles.titleWrapper}>
                <span className={styles.title}>{props.title}</span>
            </div>
            <div className={styles.line}></div>
        </div>
    );
};
