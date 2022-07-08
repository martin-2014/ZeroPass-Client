import { history, useModel } from 'umi';
import { Tag } from '@/models/tags';
import { Typography } from 'antd';
import styles from '../index.less';
import classNames from 'classnames';
const { Text } = Typography;

const handleClick = (path: string) => {
    history.push(path);
};

export const TagItem = ({ tag, icon }: { tag: Tag; icon: React.ReactNode }) => {
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

export default () => {
    const { tags } = useModel('tags');

    const shouldShowTitle = (): boolean => {
        return tags?.personal! && tags?.personal.length > 0;
    };

    const showTags = (icon: React.ReactNode): React.ReactNode[] | undefined => {
        return tags?.personal?.map((tag) => <TagItem key={tag.path} icon={icon} tag={tag} />);
    };

    return { shouldShowTitle, showTags, TagItem };
};
