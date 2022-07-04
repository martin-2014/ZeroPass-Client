import RightContent from '@/components/RightContent';
import styles from './index.less';

const Header = () => {
    return (
        <div
            className={styles.toolbar}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <HeaderWrapper />
        </div>
    );
};

const HeaderWrapper = (props: any) => {
    return (
        <div className={styles.toolbarContainter}>
            <div className={styles.left}>{/* <LeftContent /> */}</div>

            <div className={styles.right}>
                <RightContent {...props} />
            </div>
        </div>
    );
};

export default Header;
