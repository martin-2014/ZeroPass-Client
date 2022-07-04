import { Input } from 'antd';
import { useIntl } from 'umi';
import FormInput, { Props as FormInputProps } from '@/components/Form/FormInput';
import styles from './index.less';

interface Props extends Omit<FormInputProps, 'children'> {
    Icon: JSX.Element;
    placeholder?: string;
}

export default (props: Props) => {
    const Intl = useIntl();
    let placeholder = props.placeholder
        ? props.placeholder
        : Intl.formatMessage({ id: 'vault.description' });

    const { src, style, Icon, ...rest } = props;
    return (
        <div className={styles.headerWrapper} style={style}>
            <div className={styles.headerIcon}>{Icon}</div>
            <FormInput
                {...rest}
                wrapperStyle={{
                    borderRadius: '10px',
                    flex: '1',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }}
                innerStyle={{ height: rest.title ? 58 : 38 }}
            >
                <Input
                    style={{ fontSize: 20, paddingTop: rest.title ? 5 : 0 }}
                    maxLength={255}
                    placeholder={placeholder}
                />
            </FormInput>
        </div>
    );
};
