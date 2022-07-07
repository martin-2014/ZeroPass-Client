import styles from './index.less';
import { useModel } from 'umi';
import { Image } from 'antd';

interface DefaultPhotoProps {
    src: string;
    name: string;
}

export const DefaultPhoto = (props: DefaultPhotoProps) => {
    return (
        <div className={styles.defaultPhoto}>
            <Image preview={false} src={props.src} className={styles.img} />
            <div className={styles.info}>
                <div className={styles.text}>{props.name.toUpperCase()}</div>
            </div>
        </div>
    );
};

export const CurrentPhoto = (props: { src: string }) => {
    return <Image preview={false} className={styles.img} src={props.src} />;
};

const Photo = () => {
    const { initialState } = useModel('@@initialState');

    if (initialState?.currentUser) {
        let photo = (
            <DefaultPhoto
                src="./icons/default-photo.png"
                name={initialState?.currentUser?.userName?.substring(0, 1)}
            />
        );

        if (initialState.currentUser.photo) {
            photo = <CurrentPhoto src={initialState.currentUser.photo} />;
        }

        return photo;
    } else {
        return <></>;
    }
};

export default Photo;
