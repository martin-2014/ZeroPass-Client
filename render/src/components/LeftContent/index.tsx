import { useModel } from 'umi';
import styles from './index.less';
import { Typography } from 'antd';
import Photo from './photo';

const { Paragraph } = Typography;

const LeftContent = () => {
    const { initialState } = useModel('@@initialState');

    if (initialState?.currentUser) {
        const logo = <img src="./icons/logo.png"></img>;
        const name = location.hash.startsWith('#/workassigned')
            ? initialState.currentUser.company
            : initialState.currentUser.userName;
        return (
            <div className={styles.topLeft} onClick={(e) => e.stopPropagation()}>
                <div className={styles.logoContainter}>{logo}</div>
                <div className={styles.companyIconContainter}>
                    <div className={styles.companyIconContent}>
                        <div className={styles.modal}></div>
                        <Photo />
                    </div>
                </div>

                <div className={styles.companyInfo}>
                    <Paragraph ellipsis={{ tooltip: name, rows: 2 }} style={{ color: '#fff' }}>
                        {name}
                    </Paragraph>
                </div>
            </div>
        );
    } else {
        return <></>;
    }
};

export default LeftContent;
