import { Tooltip } from 'antd';
import { Help } from '@icon-park/react';
import styles from './index.less';

type Props = {
    text: string | React.ReactNode;
    style?: React.HTMLAttributes<HTMLDivElement>['style'];
};
export default (props: Props) => {
    return (
        <div
            style={{ marginLeft: 5, cursor: 'pointer', ...props.style }}
            className={styles.tipWrapper}
        >
            <Tooltip title={props.text} overlayClassName={styles.tipWrapper}>
                <Help size={16} fill="#949494" />
            </Tooltip>
        </div>
    );
};
