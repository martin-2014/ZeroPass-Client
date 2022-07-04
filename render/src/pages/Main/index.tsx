import styles from './index.less';
import Navigation from '@/components/Navigation';

export default (props: any) => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.nav}>
                <Navigation {...props}></Navigation>
            </div>
            <div className={styles.content}>{props.children}</div>
        </div>
    );
};
