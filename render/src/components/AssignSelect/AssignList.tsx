import styles from './index.less';
import { Col, Row } from 'antd';
import { AssignListItem } from './index';
import { userTitle } from './index';
import { useIntl } from 'umi';
import HubOption, { OptionType } from '../HubOption';
import Popconfirm from '../Popconfirm';
import { Delete } from '@/Icons';

type PropsItem = {
    item: AssignListItem;
    changeRole: (canAssign: boolean, value: string) => void;
    delete: (value: string) => void;
    disabled?: boolean;
    isLast?: boolean;
    ableToAssign?: boolean;
    dropdownClassName?: string;
};

export default (props: PropsItem) => {
    const Intl = useIntl();

    const onChange = (item: OptionType) => {
        const canAssign = item.value === 'true' ? true : false;
        props.changeRole(canAssign, props.item.value);
    };

    const AccessOptions: OptionType[] = [
        {
            value: 'true',
            label: 'vault.user.privilege.canAssign',
            type: 'orange',
        },
        {
            value: 'false',
            label: 'vault.user.privilege.accessOnly',
            type: 'blue',
        },
    ];

    const onDelete = () => {
        props.delete(props.item.value);
    };

    const DelButton = ({ onClick }: { onClick: (e: any) => void }) => {
        return (
            <div
                style={{
                    display:
                        props.disabled || (props.ableToAssign == false && props.item.canAssign)
                            ? 'none'
                            : '',
                }}
                className={styles.delete}
                onClick={onClick}
            >
                <Delete className="zp-icon" style={{ fontSize: 12 }} />
            </div>
        );
    };

    return (
        <>
            <Row className={styles.listItem}>
                <Col className={styles.label} span={12}>
                    {userTitle(props.item.title)}
                </Col>
                <Col span={10} className={styles.listItem}>
                    <div>
                        <HubOption
                            value={props.item.canAssign ? 'true' : 'false'}
                            options={AccessOptions}
                            theme="fill"
                            style={{ width: 140, fontSize: '12px', lineHeight: '12px' }}
                            disable={props.disabled || props.ableToAssign == false}
                            onChange={onChange}
                            key={props.item.value}
                        ></HubOption>
                    </div>
                </Col>
                <Col span={2}>
                    {props.isLast ? (
                        <Popconfirm
                            title={Intl.formatMessage({
                                id: 'vault.user.privilege.delete.confirm',
                            })}
                            okText={Intl.formatMessage({ id: 'common.yes' })}
                            cancelText={Intl.formatMessage({ id: 'common.no' })}
                            onConfirm={onDelete}
                            placement="topRight"
                        >
                            <DelButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            />
                        </Popconfirm>
                    ) : (
                        <DelButton onClick={onDelete} />
                    )}
                </Col>
            </Row>
        </>
    );
};
