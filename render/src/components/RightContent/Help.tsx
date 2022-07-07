import React, { useCallback, useState } from 'react';
import {
    QuestionCircleOutlined,
    SettingOutlined,
    ExclamationCircleOutlined,
    LogoutOutlined,
    CompassOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { More } from '@icon-park/react';
import { Menu, Badge, Row, Col, Typography } from 'antd';
import { history, FormattedMessage, useModel } from 'umi';
import HeaderDropdownWithTip from '../HeaderDropdownWithTip';
import styles from './index.less';
import type { MenuInfo } from 'rc-menu/lib/interface';
import SimpleModal from '../SimpleModal';
import About from './About';
import Settings from '@/components/RightContent/Settings';
import { sessionStore } from '@/browserStore/store';
import { localStore } from '@/browserStore/store';
import UserProfile from '@/pages/user/profile';
import Extension from './Extension';
import { openHelp } from '@/utils/tools';

const { Text } = Typography;

export type GlobalHeaderRightProps = {
    menu?: boolean;
    color?: string;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = (props) => {
    const [showSettings, setShowSettings] = useState(false);
    const [userProfile, setUserProfile] = useState(false);
    const { initialState } = useModel('@@initialState');
    const [showExtension, setShowExtension] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [newVersion, setNewVersion] = useState('');

    if (window.electron) {
        window.electron.checkForUpdates(
            (version) => {
                window.electron.downloadUpdates(null, () => {
                    setNewVersion(version);
                    if (localStore.isUpdateAutomatically && sessionStore.versionClosed != version) {
                        setShowAbout(true);
                    }
                });
            },
            null,
            null,
        );
    }

    const onMenuClick = useCallback((event: MenuInfo) => {
        const { key } = event;
        if (key == 'help') {
            help();
            return;
        } else if (key == 'about') {
            setShowAbout(true);
            return;
        } else if (key == 'settings') {
            setShowSettings(true);
            return;
        } else if (key === 'logout') {
            history.push('/user/logout');
            return;
        } else if (key === 'account') {
            setUserProfile(true);
            return;
        } else if (key === 'extension') {
            setShowExtension(true);
            return;
        }
        history.push(`/account/${key}`);
    }, []);

    const closeSettingModal = () => {
        setUserProfile(false);
    };

    const help = () => {
        openHelp();
    };

    const closeAbout = () => {
        sessionStore.versionClosed = newVersion;
        setShowAbout(false);
    };

    const closeSettings = () => {
        setShowSettings(false);
    };

    const menuHeaderDropdown = (
        <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
            {initialState?.currentUser ? (
                <>
                    <Menu.Item key="account">
                        <Row>
                            <Col span={4}>
                                <UserOutlined style={{ margin: '0 10px 0 0', fontSize: 16 }} />
                            </Col>
                            <Col span={20}>
                                <Row>
                                    <Text
                                        style={{ maxWidth: 110, lineHeight: '20px' }}
                                        ellipsis={{ tooltip: initialState.currentUser.userName }}
                                    >
                                        {initialState.currentUser.userName}
                                    </Text>
                                </Row>
                                <Row
                                    className="hubFontColorLow"
                                    style={{ fontSize: 13, lineHeight: '20px' }}
                                >
                                    <FormattedMessage id="settings.see.profile" />
                                </Row>
                            </Col>
                        </Row>
                    </Menu.Item>
                    <Menu.Divider style={{ margin: 0 }} />
                </>
            ) : (
                <></>
            )}

            <Menu.Item key="settings">
                <div>
                    <SettingOutlined />
                    <FormattedMessage id="menu.settings" />
                </div>
            </Menu.Item>
            <Menu.Item key="extension">
                <div>
                    <CompassOutlined />
                    <FormattedMessage id="setting.extension" />
                </div>
            </Menu.Item>
            <Menu.Item key="help">
                <div>
                    <QuestionCircleOutlined />
                    <FormattedMessage id="menu.help" />
                </div>
            </Menu.Item>
            <Menu.Item key="about">
                <Badge dot={newVersion ? true : false}>
                    <div>
                        <ExclamationCircleOutlined />
                        <FormattedMessage id="menu.about" />
                    </div>
                </Badge>
            </Menu.Item>
            {initialState?.currentUser ? (
                <>
                    <Menu.Divider />
                    <Menu.Item key="logout">
                        <LogoutOutlined />
                        <FormattedMessage id="menu.account.logout" />
                    </Menu.Item>
                </>
            ) : (
                <></>
            )}
        </Menu>
    );
    return (
        <div>
            <HeaderDropdownWithTip
                dropDownProps={{ overlay: menuHeaderDropdown }}
                tooltipProps={{ title: <FormattedMessage id="menu.more.tips" /> }}
            >
                <span className={`${styles.action} ${styles.account}`}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Badge dot={newVersion ? true : false}>
                            <More size={24} fill={props.color || 'white'} />
                        </Badge>
                    </div>
                </span>
            </HeaderDropdownWithTip>

            <SimpleModal
                title={<FormattedMessage id="menu.settings" />}
                visible={showSettings}
                destroyOnClose
                close={closeSettings}
                closable
                footer={null}
            >
                <Settings></Settings>
            </SimpleModal>

            <SimpleModal
                title={<FormattedMessage id="menu.about" />}
                visible={showAbout}
                destroyOnClose
                close={closeAbout}
                closable
                footer={null}
            >
                <About newVersion={newVersion} />
            </SimpleModal>

            <SimpleModal
                title={<FormattedMessage id="userProfile.title" />}
                visible={userProfile}
                close={closeSettingModal}
                destroyOnClose
                footer={null}
                zIndex={1000}
            >
                <UserProfile close={closeSettingModal} />
            </SimpleModal>

            <SimpleModal
                title={<FormattedMessage id="setting.browser.title" />}
                visible={showExtension}
                destroyOnClose
                footer={null}
                close={() => setShowExtension(false)}
            >
                <div style={{ marginTop: 30 }}>
                    <Extension gap={30} />
                </div>
            </SimpleModal>
        </div>
    );
};

export default AvatarDropdown;
