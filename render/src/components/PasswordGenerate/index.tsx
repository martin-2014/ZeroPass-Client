import { useEffect, useState } from 'react';
import styles from './index.less';
import SimpleModal from '@/components/SimpleModal';
import PasswordHistory from './history';
import PasswordGenerator from './generator';
import { FormattedMessage } from 'umi';

type PageType = 'generate' | 'history';
type PropsItem = {
    visible: boolean;
    fillPassword?: (password: string) => void;
    styles?: {};
    close?: () => void;
};

const PasswordGenerate = (props: PropsItem) => {
    const [page, setPage] = useState<PageType>('generate');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(props.visible);
        if (props.visible) setPage('generate');
    }, [props.visible]);

    const onSwitch = () => {
        if (page == 'generate') {
            setPage('history');
        } else {
            setPage('generate');
        }
    };

    const close = () => {
        props.close?.();
    };

    return (
        <SimpleModal
            visible={visible}
            close={close}
            closable
            width={360}
            footer={null}
            title={
                page === 'generate' ? (
                    <FormattedMessage id="password.generator" />
                ) : (
                    <FormattedMessage id="password.history" />
                )
            }
        >
            <div className={styles.body}>
                {page == 'generate' ? (
                    <PasswordGenerator
                        visible={visible}
                        close={close}
                        onSwitch={onSwitch}
                        fillPassword={props.fillPassword}
                    />
                ) : (
                    <PasswordHistory onSwitch={onSwitch} />
                )}
            </div>
        </SimpleModal>
    );
};

export default PasswordGenerate;
