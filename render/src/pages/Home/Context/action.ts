import { Item } from '@/pages/Home/datatypes';

export type Action = {
    type: 'init' | 'search' | 'select';
    args?: any;
};

export type ListState = {
    items?: Item[];
    search: string;
    selectedId: number;
};

export const sortItems = (items: Item[]) => {
    return items.sort((a, b) => {
        if (a.lastModified > b.lastModified) return -1;
        if (a.lastModified < b.lastModified) return 1;
        return a.title.localeCompare(b.title);
    });
};

export interface ActionFun {
    (state: ListState, args: any): ListState;
}

const init: ActionFun = (state, args) => {
    return { ...state, items: sortItems(args) };
};

const search: ActionFun = (state, args) => {
    return { ...state, search: args };
};

const select: ActionFun = (state, args) => {
    return { ...state, selectedId: args.id };
};
const actions: { [k in Action['type']]: ActionFun } = {
    init,
    search,
    select,
};

export default actions;
