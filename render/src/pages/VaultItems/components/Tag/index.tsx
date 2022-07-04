import { Tag } from 'antd';
import { Button, AutoComplete, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createVaultTags } from '@/services/api/tag';
import { errHandlers } from '@/services/api/errHandlers';
import { FormattedMessage, useIntl } from 'umi';
import { cloneDeep } from 'lodash';
import type { BaseSelectRef } from 'rc-select';
import styles from './index.less';
import HubButton from '@/components/HubButton';

const { Text } = Typography;

export type Option = {
    id?: number;
    value: string;
};
type Props = {
    optionsRes: Option[];
    callback: (data: Option[]) => void;
    buttonVisable: boolean;
    tagListRes: Option[];
};
const NEW_TAG_HEIGHT = 25;
export default ({ tagListRes, callback, buttonVisable, optionsRes }: Props) => {
    const Intl = useIntl();
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');
    const [tagList, setTagList] = useState(tagListRes);
    const [options, setOptions] = useState<Option[]>(optionsRes);
    const [buttonLoading, setButtonLoading] = useState(false);
    const optionsRef = useRef<Option[]>([]);
    const inputEl = useRef<BaseSelectRef>(null);

    useEffect(() => {
        callback(tagList);
        filter();
    }, [tagList]);
    useEffect(() => {
        setTagList(tagListRes);
    }, [tagListRes]);
    useEffect(() => {
        setOptions(optionsRes);
        optionsRef.current = cloneDeep(optionsRes);
    }, [optionsRes]);
    useEffect(() => {
        if (editing) {
            inputEl.current?.focus();
        }
    }, [editing]);

    const findRepeat = (text: string) => {
        const a = optionsRef.current.some((item) => item.value === text);
        const b = tagList.some((item) => item.value === text);
        return a || b;
    };
    const onSearch = (searchText: string) => {
        const trimedValue = searchText.trim();
        if (trimedValue) {
            if (!findRepeat(trimedValue)) {
                setOptions([
                    {
                        value: searchText,
                    },
                    ...cloneDeep(optionsRef.current),
                ]);
            } else {
                const datas = cloneDeep(optionsRef.current);
                const index = datas.findIndex((item) => item.value.trim() === trimedValue);
                if (index > -1) {
                    const temp = datas[index];
                    datas[index] = datas[0];
                    datas[0] = temp;
                }
                setOptions(datas);
            }
        } else {
            setOptions(cloneDeep(optionsRef.current));
        }
    };
    const onSelect = async (data: string, option: Option) => {
        data = data.trim();
        setEditing(false);
        if (!findRepeat(data)) {
            setButtonLoading(true);
            const res = await createVaultTags({
                name: data,
            });
            if (res.fail) {
                errHandlers.default(res);
                setButtonLoading(false);
                return;
            } else {
                option = {
                    id: res.payload?.id,
                    value: data,
                };
            }
        }
        setButtonLoading(false);
        setOptions((prev) => prev.filter((option) => option.value !== data));
        setTagList((prev) => [...prev, option]);
        setValue('');
    };
    const onChange = (data: string) => {
        setValue(data);
    };
    const onBlur = () => {
        setEditing(false);
        setValue('');
        setOptions([...cloneDeep(optionsRef.current)]);
    };
    const filter = () => {
        const res = options.filter((item) => {
            return !tagList.some((tag) => tag.id === item.id);
        });
        optionsRef.current = cloneDeep(res);
        setOptions(res);
    };
    const onClose = (option: Option) => {
        setOptions((options) => [...options, option]);
        optionsRef.current = cloneDeep([...options, option]);
        setTagList((prev) => prev.filter((data) => data.value !== option.value));
    };
    const Tags = () => {
        const tags = tagListRes.map((option) => (
            <Tag
                onClose={() => {
                    onClose(option);
                }}
                key={option.id}
                closable={buttonVisable}
                style={{
                    marginBottom: 5,
                    borderRadius: 12,
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
            <AutoComplete
                value={value}
                open={editing}
                ref={inputEl}
                options={options}
                style={{ width: 100, display: editing ? '' : 'none', height: 22 }}
                onSelect={onSelect}
                onSearch={onSearch}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={<FormattedMessage id="component.tag.newTag.placeholder" />}
                dropdownClassName="rightFormDropDown"
            ></AutoComplete>
            <HubButton
                type="default"
                size="small"
                height={22}
                style={{
                    width: '90px',
                    marginBottom: 5,
                    padding: '0px',
                    display: buttonVisable && !editing ? '' : 'none',
                }}
                loadingVisible={buttonLoading}
                onClick={() => {
                    setEditing(true);
                }}
            >
                {'+' + Intl.formatMessage({ id: 'common.newTag' })}
            </HubButton>
        </div>
    );
};
