import { CloseOutlined } from '@ant-design/icons';
import styles from './index.less';
import SearchBar from '@/components/SearchBar';
import { Space } from 'antd';

type PropsItem = {
    header?: string | JSX.Element;
    extraHeader?: string | JSX.Element;
    children: JSX.Element;
    onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const BaseContentLayout = (props: PropsItem) => {
    return (
        <div className={styles.main} id="base-content-layout">
            {props.header ? (
                <div className={styles.header}>
                    <Space size={0}>
                        <div className={styles.innerHeader}>
                            <div className={styles.serach}>
                                <SearchBar onChange={props.onSearch}></SearchBar>
                            </div>
                            {props.header}
                        </div>
                        {props.extraHeader}
                    </Space>
                </div>
            ) : (
                <></>
            )}
            <div className={styles.body}>{props.children}</div>
        </div>
    );
};

export default BaseContentLayout;
