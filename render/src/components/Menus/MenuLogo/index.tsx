import styles from './index.less';
import { Divider } from 'antd';

export default () => {
    return (
        <div className={styles.logo}>
            <img className={styles.img} src="./icons/dark/logo.png"></img>
        </div>
    );
};
