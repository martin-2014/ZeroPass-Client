import ScrollContainter from '@/components/ScrollContainter';
import { Down } from '@icon-park/react';
import styles from '../index.less';
import { history, useModel } from 'umi';
import classNames from 'classnames';
import { Tags as ModelTags, Tag } from '@/models/tags';
import { Typography } from 'antd';

const handleClick = (path: string) => {
    history.push(path);
};
const { Text } = Typography;
type Props = {
    title: string | React.ReactNode;
    icon: React.ReactNode;
};
const TagItem = ({ tag, icon }: { tag: Tag; icon: React.ReactNode }) => {
    return (
        <li
            className={classNames(
                styles.item,
                history.location.pathname === tag.path ? styles.itemActived : styles.itemHover,
            )}
            onClick={() => handleClick(tag.path)}
        >
            <div className={styles.icon}>{icon}</div>
            <Text className={styles.tagText} ellipsis={{ tooltip: tag.name }}>
                {tag.name}
            </Text>
        </li>
    );
};
const Tags = ({ title, icon }: Props) => {
    const { tags } = useModel('tags');

    const showTitle = (): boolean => {
        if (history.location.pathname.indexOf('personal') > -1) {
            return tags?.personal! && tags?.personal.length > 0;
        } else {
            return tags?.workassigned! && tags?.workassigned.length > 0;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={styles.tags}>{showTitle() ? <span>{title}</span> : <></>}</div>
            <div style={{ flex: 1 }}>
                <ScrollContainter allwaysVisible>
                    <ul
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            padding: 0,
                            margin: 0,
                        }}
                    >
                        {history.location.pathname.indexOf('personal') > -1
                            ? tags?.personal?.map((tag) => (
                                  <TagItem key={tag.path} icon={icon} tag={tag} />
                              ))
                            : tags?.workassigned?.map((tag) => (
                                  <TagItem key={tag.path} icon={icon} tag={tag} />
                              ))}
                    </ul>
                </ScrollContainter>
            </div>
        </div>
    );
};

export default Tags;
