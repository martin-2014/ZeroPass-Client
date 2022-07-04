import styles from './index.less';
import { useModel } from 'umi';
import { Image } from 'antd';

const Photo = () => {
    const { initialState } = useModel('@@initialState');

    const isCompany = location.hash.startsWith('#/workassigned');

    if (initialState?.currentUser) {
        const DefaultPhoto = () => {
            return (
                <div className={styles.defaultPhoto}>
                    <Image
                        preview={false}
                        src={
                            isCompany
                                ? './icons/company-default-logo.png'
                                : './icons/default-photo.png'
                        }
                        className={styles.img}
                    />
                    <div className={styles.info}>
                        <div className={styles.text}>
                            {isCompany
                                ? initialState?.currentUser?.company?.substring(0, 1).toUpperCase()
                                : initialState?.currentUser?.userName
                                      ?.substring(0, 1)
                                      .toUpperCase()}
                        </div>
                    </div>
                </div>
            );
        };

        let photo = <DefaultPhoto />;
        if (isCompany) {
            if (initialState.currentUser.logo) {
                photo = (
                    <Image
                        preview={false}
                        className={styles.img}
                        src={initialState.currentUser.logo}
                    />
                );
            }
        } else {
            if (initialState.currentUser.photo) {
                photo = (
                    <Image
                        preview={false}
                        className={styles.img}
                        src={initialState.currentUser.photo}
                    />
                );
            }
        }

        return photo;
    } else {
        return <></>;
    }
};

export default Photo;
