import styles from './index.less';
import MinMaxToolBar from '@/components/RightContent/MinMaxToolBar';

interface PropsItem {
    header: JSX.Element | string;
    children: JSX.Element;
}

const BaseLayout = (props: PropsItem) => {
    return (
        <div className={styles.layout}>
            <div className={styles.header}>
                <div className={styles.headerWrap}>{props.header}</div>
            </div>
            <div className={styles.body}>{props.children}</div>
            <div className={styles.toolbar}>
                <MinMaxToolBar></MinMaxToolBar>
            </div>
        </div>
    );
};

export default BaseLayout;
