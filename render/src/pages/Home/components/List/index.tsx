import AppItemToolBar from '@/components/AppItemToolBar';
import HubList, { Item as HubItem, ListProps } from '@/components/HubList';
import { ReactNode } from 'react';
import { Item as VaultItem } from '@/pages/Home/datatypes';
import More from '../More';
import styles from './index.less';

export type Item<T> = HubItem<T> & VaultItem;
export interface FavouriteListProps<T> extends Omit<ListProps<T>, 'data'> {
    addButtonRender?: () => ReactNode;
    onSelected?: (data: Item<T>) => void;
    changeEdit: (edit: boolean, item: Item<T>) => void;
    items: VaultItem[];
}

export default function <T>(props: FavouriteListProps<T>) {
    const { onSelected, changeEdit, items } = props;

    return (
        <div className={styles.main}>
            <>
                {items.length > 0 ? (
                    <HubList
                        toolbarRender={(data: Item<T>) => (
                            <AppItemToolBar
                                more={
                                    data && (
                                        <More
                                            onEdit={(edit) => {
                                                changeEdit(edit, data);
                                            }}
                                            item={data}
                                            showPin={true}
                                        ></More>
                                    )
                                }
                            />
                        )}
                        data={items}
                        onClick={(data) => {
                            onSelected?.(data);
                        }}
                        {...props}
                    />
                ) : (
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                backgroundImage: `url(./icons/search-watermark.png)`,
                                width: 47,
                                height: 39,
                                margin: 'auto',
                            }}
                        ></div>
                    </div>
                )}
            </>
        </div>
    );
}
