import { Tag } from '@/models/tags';
import { getPersonalEntryTag } from '@/services/api/tag';
import { useModel } from 'umi';

let dataTags: Tag[] | undefined;

const getTagData = async (forceReload: boolean) => {
    if (!forceReload && dataTags) {
        return Promise.resolve(dataTags);
    }

    const res = await getPersonalEntryTag();
    if (res.fail) {
        return;
    }
    return res
        .payload!.map((item) => {
            const path = `/personal/menus/quickerfinder/tags/${item.id}`;
            return {
                path,
                name: item.name,
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
};

export default () => {
    const { setTags } = useModel('tags');

    const setTagData = (data: Tag[] | undefined) => {
        setTags((tags) => {
            const srcData = { personal: data };
            if (tags && srcData) {
                return { ...tags, ...srcData };
            }
            return srcData;
        });
    };

    const setTag = async () => {
        dataTags = await getTagData(false);
        setTagData(dataTags);
    };

    const setNewTag = async () => {
        dataTags = await getTagData(true);
        setTagData(dataTags);
    };

    const clearTagMenuCache = () => {
        dataTags = undefined;
    };

    return {
        setTag,
        setNewTag,
        clearTagMenuCache,
    };
};
