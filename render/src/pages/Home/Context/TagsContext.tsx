import { getPersonalEntryTag } from '@/services/api/tag';
import { createContext, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { TagOption } from '../datatypes';

type Tag = TagOption;

type TagsContextType = {
    addTag: (name: string) => { id: string; value: string } | null;
    tags?: Tag[];
};

const initialContext: TagsContextType = {
    addTag: () => null,
};

export const TagsContext = createContext<TagsContextType>(initialContext);

const sortTags = (tags: Tag[]) => tags.sort((a, b) => a.value.localeCompare(b.value));

export const TagsContextProvider = (props: PropsWithChildren<any>) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const isUnmount = useRef(false);

    const loadTags = async () => {
        const res = await getPersonalEntryTag();
        if (!res.fail && !isUnmount.current) {
            const tags = res.payload!.map((tag) => ({ id: tag.id!, value: tag.name }));
            setTags(sortTags(tags));
        }
        return res;
    };

    const addTag = (name: string) => {
        for (const tag of tags) {
            if (tag.value === name) {
                return null;
            }
        }
        const item = { id: name, value: name };
        setTags((pre) => sortTags([...pre, item]));
        return item;
    };

    useEffect(() => {
        isUnmount.current = false;
        loadTags();
        return () => {
            isUnmount.current = true;
        };
    }, [props]);

    return <TagsContext.Provider value={{ tags, addTag }}>{props.children}</TagsContext.Provider>;
};
