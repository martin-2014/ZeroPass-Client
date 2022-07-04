import { Row, Select, Space, Checkbox, Radio, RadioChangeEvent, Tooltip, Button } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { localStore } from '@/browserStore/store';
import { getLocale, setLocale, FormattedMessage, useModel, useIntl } from 'umi';
import styles from './index.less';
import FormItem from '@/components/Form/FormItem';
import FormInput from '@/components/Form/FormInput';
import FormGroup from '@/components/Form/FormGroup';
import SimpleModal from '@/components/SimpleModal';
import HubButton from '@/components/HubButton';
import DataRoamingSetting from './DataRoamingSetting';
import { updateSyncSetting } from '@/services/api/user';
import message from '@/utils/message';

const { Option } = Select;
export type Props = {};

export type RoamingBackupType = 'google' | 'ipfs';

export interface RoamingSettingData {
    enable: boolean;
    type?: RoamingBackupType;
}

export default (pros: Props) => {
    const [selectedLang, setSelectedLang] = useState(() => getLocale());
    const { lock, setLock } = useModel('autoLock');
    const { setLanguage } = useModel('timeAgo');
    const { initialState, setInitialState } = useModel('@@initialState');
    const [showRoamingSetting, setShowRoamingSetting] = useState<boolean>(false);
    const backupTypeRef = useRef<RoamingSettingData>(
        initialState?.currentUser?.setting?.sync ?? { enable: false },
    );
    const [saveSyncLoading, setSaveSyncLoading] = useState<boolean>(false);
    const Intl = useIntl();

    const showRoamingSettingDialog = (show: boolean) => {
        setShowRoamingSetting(show);
    };

    function handleLanguageChange(value) {
        setLocale(value, false);
        if (window.electron) {
            electron.sendLocale(getLocale());
        }

        setSelectedLang(value);
        setLanguage(value);
    }

    const saveRoamingSetting = async () => {
        console.log('initstate', initialState);
        setSaveSyncLoading(true);
        const res = await updateSyncSetting(backupTypeRef.current);
        if (res.fail) {
            message.errorIntl(res.errorId);
        } else {
            const copyState = {
                ...initialState,
            };
            const setting = copyState?.currentUser?.setting ?? {};
            setting['sync'] = backupTypeRef.current;
            copyState!.currentUser!.setting = setting;
            setInitialState(copyState);
            showRoamingSettingDialog(false);
        }
        setSaveSyncLoading(false);
    };

    function handleCloseAppChange(value: 1 | 2) {
        localStore.closeOption = value;
    }

    const lockOptions = [
        { value: 0, label: 'setting.lock.never' },
        { value: 60, label: 'setting.lock.minute.one' },
        { value: 120, label: 'setting.lock.minute.two' },
        { value: 300, label: 'setting.lock.minute.five' },
        { value: 600, label: 'setting.lock.minute.ten' },
        { value: 1800, label: 'setting.lock.minute.thirty' },
        { value: 3600, label: 'setting.lock.hour.one' },
        { value: 3600 * 4, label: 'setting.lock.hour.four' },
        { value: 3600 * 8, label: 'setting.lock.hour.eight' },
    ];

    const hangeLockChange = (v: number) => {
        setLock(v);
    };

    const FormItems = (props: {
        title: JSX.Element;
        label: JSX.Element | null;
        content: JSX.Element;
    }) => {
        return (
            <div className={styles.item}>
                <Row className={styles.label} style={{ marginTop: 12 }}>
                    {props.title}
                </Row>
                <Row>
                    <FormGroup height={60}>
                        <FormItem label={props.label}>
                            <FormInput>{props.content}</FormInput>
                        </FormItem>
                    </FormGroup>
                </Row>
            </div>
        );
    };

    const RoamingText = () => {
        const [text, setText] = useState('Disable');
        useEffect(() => {
            const sync = initialState?.currentUser?.setting?.sync;
            if (sync?.enable === true) {
                if (sync?.type === 'ipfs') {
                    setText('IPFS');
                } else if (localStore.roamingSetting?.type === 'google') {
                    setText('Google');
                }
            } else {
                setText('Disable');
            }
        }, [showRoamingSetting]);
        return <span>{text}</span>;
    };

    const items = [];
    items.push({
        title: <FormattedMessage id="settings.divider.language" />,
        label: <FormattedMessage id="settings.language.choose" />,
        content: (
            <Select
                className={styles.select}
                defaultValue={selectedLang}
                onChange={handleLanguageChange}
            >
                <Option value="en-US">English</Option>
                <Option value="de-DE">Deutsch</Option>
                <Option value="fr-FR">Français</Option>
                <Option value="it-IT">Italiano</Option>
                <Option value="es-ES">Español</Option>
                <Option value="pt-PT">Português</Option>
                <Option value="ja-JP">日本語</Option>
                <Option value="ko-KR">한국인</Option>
                <Option value="th-TH">ไทย</Option>
                <Option value="ms-MY">Melayu</Option>
                <Option value="vi-VN">Tiếng Việt</Option>
                <Option value="zh-CN">中文（简体）</Option>
                <Option value="zh-TW">中文（繁體）</Option>
            </Select>
        ),
    });

    items.push({
        title: <FormattedMessage id="settings.auto.lock" />,
        label: <FormattedMessage id="settings.auto.lock.label" />,
        content: (
            <Select defaultValue={lock ?? 0} onChange={hangeLockChange}>
                {lockOptions.map((item) => (
                    <Option value={item.value} key={item.value}>
                        {<FormattedMessage id={item.label} />}
                    </Option>
                ))}
            </Select>
        ),
    });

    if (initialState?.currentUser) {
        items.push({
            title: <FormattedMessage id="setting.sync.title" />,
            label: <FormattedMessage id="setting.sync.dialog.title" />,
            content: (
                <Button
                    block
                    onClick={(e) => showRoamingSettingDialog(true)}
                    className={styles.roamingButton}
                >
                    <RoamingText />
                </Button>
            ),
        });
    }

    items.push({
        title: <FormattedMessage id="settings.divider.other" />,
        label: <FormattedMessage id="closeOption.title" />,
        content: (
            <Select
                className={styles.select}
                defaultValue={localStore.closeOption}
                onChange={handleCloseAppChange}
            >
                <Option value={1}>{<FormattedMessage id="closeOption.Minimize" />}</Option>
                <Option value={2}>{<FormattedMessage id="closeOption.Quit" />}</Option>
            </Select>
        ),
    });

    return (
        <div className={styles.main}>
            {items.map((item, index) => (
                <FormItems
                    key={index}
                    title={item.title}
                    label={item.label}
                    content={item.content}
                />
            ))}
            <SimpleModal
                title={<FormattedMessage id="setting.sync.dialog.title" />}
                visible={showRoamingSetting}
                destroyOnClose
                width={520}
                closable
                close={() => showRoamingSettingDialog(false)}
                footer={
                    <Space>
                        <HubButton
                            style={{ margin: 'auto', width: '100px' }}
                            type="default"
                            onClick={(e) => showRoamingSettingDialog(false)}
                        >
                            {Intl.formatMessage({ id: 'setting.sync.button.cancel' })}
                        </HubButton>
                        <HubButton
                            style={{ margin: 'auto', width: '100px' }}
                            type="primary"
                            onClick={(e) => saveRoamingSetting()}
                            loadingVisible={saveSyncLoading}
                        >
                            {Intl.formatMessage({ id: 'setting.sync.button.save' })}
                        </HubButton>
                    </Space>
                }
            >
                <DataRoamingSetting ref={backupTypeRef} />
            </SimpleModal>
        </div>
    );
};
