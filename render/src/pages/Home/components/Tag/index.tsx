import { Spin, Tag } from 'antd';
import { AutoComplete, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { cloneDeep } from 'lodash';
import type { BaseSelectRef } from 'rc-select';
import styles from './index.less';
import HubButton from '../../../../components/HubButton';
import { TagOption } from '../../datatypes';
import { useTag } from '../../Context/hooks';

const { Text } = Typography;

type Props = {
    selectedTags: TagOption[];
    buttonVisable: boolean;
    onSelectedChanged?: (data: TagOption[]) => void;
};
const NEW_TAG_HEIGHT = 24;
export default ({ selectedTags, buttonVisable, onSelectedChanged }: Props) => {
    const Intl = useIntl();
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');
    const [buttonLoading, setButtonLoading] = useState(false);
    const originalOptions = useRef<TagOption[]>([]);
    const inputEl = useRef<BaseSelectRef>(null);
    const { tags, addTag } = useTag();
    const [options, setOptions] = useState(tags);

    useEffect(() => {
        if (tags !== undefined) {
            const data = tags.filter((item) => {
                return !selectedTags.some((tag) => tag.id === item.id);
            });
            setOptions(data);
            originalOptions.current = [...data];
        }
    }, [tags, selectedTags]);
    useEffect(() => {
        if (editing) {
            inputEl.current?.focus();
        }
    }, [editing]);
    const findRepeat = (text: string) => tags?.some((item) => item.value === text);
    const onSearch = (searchText: string) => {
        const trimedValue = searchText.trim();
        if (trimedValue) {
            if (!findRepeat(trimedValue)) {
                setOptions([
                    {
                        value: searchText,
                    },
                    ...cloneDeep(originalOptions.current),
                ]);
            } else {
                const datas = cloneDeep(originalOptions.current);
                const index = datas.findIndex((item) => item.value.trim() === trimedValue);
                if (index > -1) {
                    const temp = datas[index];
                    datas[index] = datas[0];
                    datas[0] = temp;
                }
                setOptions(datas);
            }
        }
    };
    const onSelect = async (data: string, option: TagOption) => {
        data = data.trim();
        setEditing(false);
        if (!findRepeat(data)) {
            setButtonLoading(true);
            const res = addTag(data);
            if (res) {
                option = res;
            }
        }
        setButtonLoading(false);
        onSelectedChanged?.([...selectedTags, option]);
        setValue('');
    };
    const onChange = (data: string) => {
        setValue(data);
    };
    const onBlur = () => {
        setEditing(false);
        setValue('');
        setOptions([...cloneDeep(originalOptions.current)]);
    };
    const onClose = (option: TagOption) => {
        onSelectedChanged?.(selectedTags.filter((t) => t.value !== option.value));
    };
    const Tags = () => {
        const tags = selectedTags.map((option) => (
            <Tag
                onClose={() => {
                    onClose(option);
                }}
                key={option.id}
                closable={buttonVisable}
                style={{
                    height: NEW_TAG_HEIGHT,
                    marginBottom: '4px',
                    borderRadius: '12px',
                }}
            >
                <Text style={{ maxWidth: 120 }} ellipsis={{ tooltip: option.value }}>
                    {option.value}
                </Text>
            </Tag>
        ));
        return <>{tags}</>;
    };

    return (
        <div
            style={{ height: '100%', display: 'flex', flexWrap: 'wrap' }}
            className={styles.autoComSelect}
        >
            <Tags></Tags>
            <Spin spinning={tags === undefined && buttonVisable}>
                {editing ? (
                    <AutoComplete
                        value={value}
                        open={editing}
                        ref={inputEl}
                        options={options}
                        style={{ width: 100, height: NEW_TAG_HEIGHT, marginBottom: 4 }}
                        onSelect={onSelect}
                        onSearch={onSearch}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={<FormattedMessage id="component.tag.newTag.placeholder" />}
                    ></AutoComplete>
                ) : (
                    <></>
                )}
                {buttonVisable && !editing ? (
                    <HubButton
                        type="default"
                        width={90}
                        height={NEW_TAG_HEIGHT}
                        disable={tags === undefined}
                        style={{
                            padding: 0,
                            marginBottom: 4,
                        }}
                        loadingVisible={buttonLoading}
                        onClick={() => {
                            setEditing(true);
                        }}
                    >
                        {'+' + Intl.formatMessage({ id: 'common.newTag' })}
                    </HubButton>
                ) : (
                    <></>
                )}
            </Spin>
        </div>
    );
};
