import { Carousel, Checkbox, Modal } from 'antd';
import { CarouselRef } from 'antd/lib/carousel';
import styles from './index.less';
import { useEffect, useRef, useState } from 'react';
import HubButton from '../HubButton';
import { FormattedMessage, useModel, useIntl } from 'umi';
import { localStore, sessionStore } from '@/browserStore/store';

const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            resolve(img);
        };
    });
};

// Users and Teams
// Client Containers
// Web Logins and to assign
// Web Logins and to bind to a Client Container
const adminImages = [
    './admin-1.png',
    './admin-2.png',
    './admin-3.png',
    './admin-4.png',
    './admin-5.png',
];
const adminTips = ['tip.personal.1', 'tip.admin.2', 'tip.admin.3', 'tip.admin.4', 'tip.admin.5'];
const personalTips = ['tip.personal.1', 'tip.personal.2', 'tip.personal.3', 'tip.personal.4'];
const personalImages = [
    './personal-1.png',
    './personal-2.png',
    './personal-3.png',
    './personal-4.png',
];
export default () => {
    const Intl = useIntl();
    const [visible, setVisible] = useState(false);
    const checkRef = useRef(false);
    const { initialState } = useModel('@@initialState');
    const isAdmin = initialState?.currentUser?.isAdmin;
    const [tips, setTips] = useState(isAdmin ? adminTips[0] : personalTips[0]);
    const carouselRef = useRef<CarouselRef>(null);

    const handleNext = () => {
        carouselRef.current?.next();
    };
    const handlePrev = () => {
        carouselRef.current?.prev();
    };
    const Right = () => {
        return <div className={styles.arrowRight} onClick={handleNext} />;
    };
    const Left = () => {
        return <div className={styles.arrowLeft} onClick={handlePrev} />;
    };
    const handleSkip = () => {
        setVisible(false);
        isAdmin
            ? (localStore.skipAdmin = checkRef.current)
            : (localStore.skipUser = checkRef.current);
    };
    const handleChange = (e: any) => {
        checkRef.current = e.target.checked;
    };

    const getData = async () => {
        if (isAdmin) {
            const loadImages = adminImages.map((src) => loadImage(src));
            await Promise.all(loadImages);
            setVisible(!localStore.skipAdmin);
        } else {
            const loadImages = personalImages.map((src) => loadImage(src));
            await Promise.all(loadImages);
            setVisible(!localStore.skipUser);
        }
    };
    useEffect(() => {
        if (!sessionStore.token || !sessionStore.token.length) return;
        getData();
    }, []);
    // Web Logins
    const Footer = (
        <div style={{ display: 'flex', color: '#f5be00', alignItems: 'center' }}>
            <div style={{ whiteSpace: 'nowrap', marginLeft: '5px' }}>
                <FormattedMessage id="tip.tips" />: <FormattedMessage id={tips} />
            </div>
            <div
                style={{
                    width: '100%',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >
                <Checkbox className={styles.check} onChange={handleChange} />
                <div style={{ color: 'white', margin: '0 15px 0 5px' }}>
                    <FormattedMessage id="tip.not.show.again" />
                </div>
                <HubButton size="nomal" onClick={handleSkip} style={{ marginRight: '5px' }}>
                    {Intl.formatMessage({ id: 'tip.skip' })}
                </HubButton>
            </div>
        </div>
    );

    const beforeChange = (_: any, to: number) => {
        isAdmin ? setTips(adminTips[to]) : setTips(personalTips[to]);
    };
    return (
        <Modal
            footer={false}
            wrapClassName={styles.modalWrap}
            destroyOnClose
            bodyStyle={{ padding: 0, marginTop: -70, background: '#292C31' }}
            closable={false}
            width="750px"
            zIndex={10000}
            visible={visible}
            mask={true}
            maskStyle={{ zIndex: 1008, marginTop: '50px' }}
        >
            <div
                style={{ width: '100%', borderRadius: '4px', border: '2px solid #f5be00' }}
                className={styles.Tip}
            >
                <Carousel
                    arrows
                    autoplay={false}
                    autoplaySpeed={5000}
                    prevArrow={<Left />}
                    nextArrow={<Right />}
                    ref={carouselRef}
                    beforeChange={beforeChange}
                >
                    {isAdmin
                        ? adminImages.map((src) => (
                              <div key={src}>
                                  <img src={src} />
                              </div>
                          ))
                        : personalImages.map((src) => (
                              <div key={src}>
                                  <img src={src} />
                              </div>
                          ))}
                </Carousel>
                {Footer}
            </div>
        </Modal>
    );
};
