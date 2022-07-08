import useMenuTags from '@/components/Menus/HomeMenu/Tags/useMenuTags';
import ScrollContainter from '@/components/ScrollContainter';
import styles from '../index.less';

type Props = {
    title: string | React.ReactNode;
    icon: React.ReactNode;
};

const Tags = ({ title, icon }: Props) => {
    const { shouldShowTitle, showTags } = useMenuTags();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={styles.tags}>{shouldShowTitle() ? <span>{title}</span> : <></>}</div>
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
                        {showTags(icon)}
                    </ul>
                </ScrollContainter>
            </div>
        </div>
    );
};

export default Tags;
