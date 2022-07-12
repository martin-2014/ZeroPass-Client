import { Carousel, Checkbox, Modal } from 'antd';
import { CarouselRef } from 'antd/lib/carousel';
import styles from './index.less';
import { useEffect, useRef } from 'react';
import HubButton from '@/components/HubButton';
import { FormattedMessage, useIntl } from 'umi';
import { sessionStore } from '@/browserStore/store';
import useTip from '@/components/Tip/useTip';

// Users and Teams
// Client Containers
// Web Logins and to assign
// Web Logins and to bind to a Client Container

export default () => {
    const Intl = useIntl();
    const carouselRef = useRef<CarouselRef>(null);

    const { visible, tips, checkRef, handleSkip, getData, beforeChange, tipsInfo } = useTip();

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

    const handleChange = (e: any) => {
        checkRef.current = e.target.checked;
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
                    {tipsInfo().map((src) => (
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
