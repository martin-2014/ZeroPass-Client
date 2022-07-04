import { getPersonalEntryTag, getWorkVisibleEntryTag } from '@/services/api/tag';
import { useModel } from 'umi';
import { Tag } from '@/models/tags';

let personalDatatags: Tag[] | undefined;
let workassignedDatatags: Tag[] | undefined;

const getTagData = async (type: 'personal' | 'workassigned', Singleton: boolean) => {
    if (Singleton) {
        if (type === 'personal' && personalDatatags) {
            return Promise.resolve(personalDatatags);
        } else if (type === 'workassigned' && workassignedDatatags) {
            return Promise.resolve(workassignedDatatags);
        }
    }
    const requester = type === 'personal' ? getPersonalEntryTag : getWorkVisibleEntryTag;
    const res = await requester();
    if (res.fail) {
        return;
    }
    return res
        .payload!.map((item) => {
            const path = `/${type}/menus/quickerfinder/tags/${item.id}`;
            return {
                path,
                name: item.name,
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
};
export default () => {
    const { setTags } = useModel('tags');
    const setTagData = (data: Tag[] | undefined, type: string) => {
        setTags((tags) => {
            const srcData = { [type]: data };
            if (tags && srcData) {
                return { ...tags, ...srcData };
            }
            return srcData;
        });
    };
    const setTag = async (type: 'personal' | 'workassigned') => {
        if (type === 'personal') {
            personalDatatags = await getTagData(type, true);
            setTagData(personalDatatags, type);
        } else {
            workassignedDatatags = await getTagData(type, true);
            setTagData(workassignedDatatags, type);
        }
    };
    const setNewTag = async (type: 'personal' | 'workassigned') => {
        if (type === 'personal') {
            personalDatatags = await getTagData(type, false);
            setTagData(personalDatatags, type);
        } else {
            workassignedDatatags = await getTagData(type, false);
            setTagData(workassignedDatatags, type);
        }
    };

    const clearPersonalTagMenuCache = () => {
        personalDatatags = undefined;
    };
    const clearWorkAssignedTagMenuCache = () => {
        workassignedDatatags = undefined;
    };

    return {
        setTag,
        setNewTag,
        clearPersonalTagMenuCache,
        clearWorkAssignedTagMenuCache,
    };
};
