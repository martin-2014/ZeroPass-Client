import { Input } from 'antd';
import { useIntl } from 'umi';
import { Search } from '@icon-park/react';

type Props = {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    style?: {};
};

const SearchBar = (props: Props) => {
    const intl = useIntl();
    return (
        <Input
            allowClear
            prefix={
                <Search
                    theme="outline"
                    size="16"
                    fill="#bbbbbb"
                    strokeLinejoin="miter"
                    strokeLinecap="butt"
                />
            }
            style={{ height: '26px', borderRadius: '13px', ...props.style }}
            onChange={(e) => {
                props.onChange?.(e);
            }}
            placeholder={intl.formatMessage({ id: 'common.search' })}
        ></Input>
    );
};

export default SearchBar;
