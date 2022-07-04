import styles from '@/pages/Tools/PasswordHealth/GroupList.less';
import { Right } from '@icon-park/react';
import classNames from 'classnames';
import { Table } from 'antd';
import { useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { FormattedMessage } from 'umi';

type Props = {
    columns: ColumnsType<any>;
    dataSource: any[];
};
export default (props: Props) => {
    const [visible, setVisible] = useState(true);
    return (
        <li className={styles.li}>
            <div className={visible ? '' : styles.groupWrapper}>
                <div
                    className={styles.groupTitle}
                    onClick={() => {
                        setVisible((a) => !a);
                    }}
                >
                    <Right
                        className={classNames(styles.btn, visible ? styles.expanded : '')}
                    ></Right>
                    <span>
                        <FormattedMessage id="common.group.reused.password" />
                    </span>
                </div>
                <div className={styles.groupContent} style={{ display: visible ? '' : 'none' }}>
                    <Table
                        pagination={false}
                        tableLayout="fixed"
                        columns={props.columns}
                        dataSource={props.dataSource}
                    ></Table>
                </div>
            </div>
        </li>
    );
};
