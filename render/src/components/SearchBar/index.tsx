import { Input } from 'antd';
import { useIntl } from 'umi';

type Props = {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    style?: {};
};

const SearchBar = (props: Props) => {
    const intl = useIntl();
    return (
        <Input
            allowClear
            prefix={<img src="./search.svg" />}
            style={{ height: '26px', borderRadius: '13px', ...props.style }}
            onChange={(e) => {
                props.onChange?.(e);
            }}
            placeholder={intl.formatMessage({ id: 'common.search' })}
        ></Input>
    );
};

export default SearchBar;
