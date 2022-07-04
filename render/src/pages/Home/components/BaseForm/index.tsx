import RightForm from '@/components/RightForm';
import { StarFilled } from '@ant-design/icons';
import { Edit } from '@icon-park/react';
import { Tooltip, Typography } from 'antd';
import { useList } from '../../Context/hooks';
import styles from './index.less';
import More from '../More';
import { useIntl } from 'umi';

const { Text } = Typography;
export type FormHeader = {
    title: string;
    Icon: JSX.Element;
};
export type Props = {
    onSave: () => void;
    onCancel: () => void;
    onEdit: (editing: boolean) => void;
    children: JSX.Element;
    isEdit: boolean;
    formHeader?: FormHeader;
    loadingVisible?: boolean;
    editLoading?: boolean;
    visible: boolean;
};

export default (props: Props) => {
    const Intl = useIntl();
    const { onCancel, onSave, isEdit, onEdit, loadingVisible, formHeader, editLoading, visible } =
        props;
    const { selectedItem } = useList();
    const handleSave = () => {
        if (isEdit) {
            onSave();
        }
    };
    const handleCancel = () => {
        onCancel();
    };

    return (
        <RightForm
            visible={visible}
            loading={loadingVisible}
            position="static"
            onCancel={handleCancel}
            onSave={handleSave}
            status={isEdit ? 'edit' : 'view'}
            editEnable={false}
            actions={
                selectedItem ? [<More onEdit={onEdit} item={selectedItem} showPin={true} />] : []
            }
        >
            <>
                <div className={styles.header} style={{ display: isEdit ? 'none' : '' }}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.leftContainter}>
                            <div className={styles.img} style={{ position: 'relative' }}>
                                {formHeader?.Icon}
                                <StarFilled
                                    style={{
                                        display: selectedItem?.fav ? '' : 'none',
                                        position: 'absolute',
                                        color: '#ffd800',
                                        right: '3px',
                                        bottom: '2px',
                                    }}
                                />
                            </div>
                            <Text
                                className={styles.title}
                                ellipsis={{ tooltip: formHeader?.title }}
                                style={{ paddingRight: 20, paddingLeft: 11 }}
                            >
                                {formHeader?.title}
                            </Text>
                        </div>
                    </div>
                </div>
                {props.children}
            </>
        </RightForm>
    );
};
