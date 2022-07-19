import { useModel } from 'umi';
import styles from './index.less';
import { Typography } from 'antd';
import Photo from '@/components/LeftContent/photo';
import AutoLock from './AutoLock';

const { Paragraph } = Typography;

export const Content = (props: { name?: string }) => {
    const logo = <img src="./icons/logo.png"></img>;
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
                <Paragraph ellipsis={{ tooltip: props.name, rows: 2 }} style={{ color: '#fff' }}>
                    {props.name}
                </Paragraph>
            </div>
            <AutoLock />
        </div>
    );
};

const LeftContent = () => {
    const { initialState } = useModel('@@initialState');
    if (initialState?.currentUser) {
        const name = initialState.currentUser.userName;
        return <Content name={name} />;
    } else {
        return <></>;
    }
};

export default LeftContent;
