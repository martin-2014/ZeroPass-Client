import { FormattedMessage, useModel } from 'umi';
import Popconfirm from '@/components/Popconfirm';
import { Item } from '@/pages/Home/datatypes';
import GeneralMore from '@/components/GeneralMore';
import { MenuRender } from '@/components/GeneralMore';
import { StarFilled, StarOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useList } from '@/pages/Home/Context/hooks';
import useTagList from '@/hooks/useTagList';
import { useMemo, useRef, useState } from 'react';
import { MetaMaskRawDataDetail, VaultItemType, VaultItemView } from '@/services/api/vaultItems';
import { Brain, MenuUnfold, Redo, ShareThree, Edit } from '@icon-park/react';
import message from '@/utils/message';
import MetaMaskRecover from './MetaMaskRecover';
import MetaMaskExtract from './WalletMnemonicReveal';
import WalletDetailList from './WalletDetailList';
import { memo } from 'react';
import { OpenDefaultBrowser, OpenSuperBrowser } from '@/components/Actions';
import { localStore } from '@/browserStore/store';
import { Delete } from '@/Icons';

type Props = {
    onEdit: (editing: boolean) => void;
    item: Item;
    showPin?: boolean;
    extraAction?: React.ReactNode[];
};

const isWalletType = (item: Item) => {
    return (
        item.type === VaultItemType.MetaMaskRawData ||
        item.type === VaultItemType.MetaMaskMnemonicPhrase ||
        item.type === VaultItemType.Addresses
    );
};

const MoreMenu = (props: Props) => {
    const { personal, work, selectedId, setSelectedId } = useList();
    const { setNewTag } = useTagList();
    const { initialState } = useModel('@@initialState');
    const [walletDetailVisible, setWalletDetailVisible] = useState(false);
    const [walletExplorerVisible, setWalletExplorerVisible] = useState(false);
    const [walletRecoverVisible, setWalletRecoverVisible] = useState(false);
    const [mnemonicRevealVisible, setMnemonicRevealVisible] = useState(false);
    const openRef = useRef(null);

    const renderOpenBrowser = (item: Item) => {
        let icon;
        if (item.isDomainItem) {
            if (item.containerId) {
                icon = (
                    <OpenSuperBrowser
                        type="workassign"
                        appId={item.key}
                        containerId={item.containerId}
                        ref={openRef}
                        noTips={true}
                    />
                );
            } else {
                icon = (
                    <OpenDefaultBrowser
                        type="workassign"
                        appId={item.key}
                        domainId={-1}
                        ref={openRef}
                        noTips={true}
                    />
                );
            }
        } else {
            icon = (
                <OpenDefaultBrowser
                    type="personal"
                    appId={item.key}
                    domainId={localStore.personalDomainId}
                    action="fill"
                    ref={openRef}
                    noTips={true}
                />
            );
        }

        const label = <FormattedMessage id="common.menu.open" />;
        const onClick = () => {
            openRef?.current?.onClick();
        };

        const key = 'openBrowser';
        return { icon, label, onClick, key };
    };

    const renderEdit = (item: Item) => {
        const icon = <Edit />;
        const label = <FormattedMessage id="common.menu.edit" />;
        const onClick = () => {
            props.onEdit(true);
        };
        const key = 'edit';
        return { icon, label, onClick, key };
    };

    const renderFav = (item: Item) => {
        const icon = item.fav ? <StarFilled style={{ color: '#ffd800' }} /> : <StarOutlined />;

        const label = item.fav ? (
            <FormattedMessage id="vault.unfavorite"></FormattedMessage>
        ) : (
            <FormattedMessage id="vault.favourite"></FormattedMessage>
        );

        const onClick = () => {
            if (!item.fav) {
                item.isDomainItem ? work.favourite(+item.key) : personal.favourite(item.key);
            } else {
                item.isDomainItem ? work.unfavourite(+item.key) : personal.unfavourite(item.key);
            }
        };
        const key = 'fav';
        return { icon, onClick, label, key };
    };

    const renderDelete = (item: Item) => {
        const icon = (
            <Popconfirm
                style={{ width: '100%' }}
                title={<FormattedMessage id="common.delete"></FormattedMessage>}
                onConfirm={() => {
                    handleDelete();
                }}
                okText={<FormattedMessage id="common.yes"></FormattedMessage>}
                cancelText={<FormattedMessage id="common.no"></FormattedMessage>}
            >
                <Delete />
            </Popconfirm>
        );
        const handleDelete = async () => {
            if (item.type === VaultItemType.MetaMaskRawData && electron) {
                await electron.deleteMetaMaskWalletBackup({
                    userId: initialState?.currentUser?.id!,
                    backupName: (item as VaultItemView<MetaMaskRawDataDetail>).detail.dataFile,
                });
            }
            const res = await personal.delete(item.id);
            if (!res.fail) {
                if (selectedId === item.id) {
                    setSelectedId(-1);
                }
                setNewTag();
            }
        };
        const label = (
            <Popconfirm
                style={{ width: '100%' }}
                title={<FormattedMessage id="common.delete"></FormattedMessage>}
                onConfirm={() => {
                    handleDelete();
                }}
                okText={<FormattedMessage id="common.yes"></FormattedMessage>}
                cancelText={<FormattedMessage id="common.no"></FormattedMessage>}
            >
                <div style={{ width: '100%' }}>
                    <FormattedMessage id="common.delete.tip"></FormattedMessage>
                </div>
            </Popconfirm>
        );
        const tooltip = <FormattedMessage id="common.delete.tip"></FormattedMessage>;
        const key = 'delete';
        return { icon, label, tooltip, key };
    };

    const renderAssign = (item: Item) => {
        const icon = <ShareThree theme="outline" />;
        const label = <FormattedMessage id="vault.assign" />;
        const onClick = () => {
            props.onEdit(true);
        };
        const key = 'assign';
        return { icon, label, onClick, key };
    };

    const renderWalletExplorer = (item: Item) => {
        const icon = <MenuUnfold theme="outline" />;
        const onClick = () => {
            setWalletExplorerVisible(true);
        };
        const label = <FormattedMessage id="wallet.explorer" />;
        const key = 'wallet.explorer';
        return { icon, onClick, label, key };
    };

    const renderWalletDetail = (item: Item) => {
        const icon = <UnorderedListOutlined />;
        const onClick = () => {
            setWalletDetailVisible(true);
        };
        const label = <FormattedMessage id="wallet.details" />;
        const key = 'wallet.details';
        return { icon, onClick, label, key };
    };

    const renderRecover = (item: Item) => {
        const onClick = async () => {
            const detail: MetaMaskRawDataDetail = item.detail;
            const args = {
                userId: initialState?.currentUser?.id!,
                backupName: detail.dataFile,
            };

            if (!(await electron.existsMetaMaskWalletBackup(args))) {
                message.errorIntl('vault.metaMaskRawData.msg.noDataFile');
            } else {
                setWalletRecoverVisible(true);
            }
        };
        const icon = <Redo />;
        const label = <FormattedMessage id="vault.metaMaskRawData.menu.recover" />;
        const key = 'metaMask.recover';
        return { icon, onClick, label, key };
    };

    const renderExportMnemonic = (item: Item) => {
        const onClick = async () => {
            const detail: MetaMaskRawDataDetail = item.detail;
            const args = {
                userId: initialState?.currentUser?.id!,
                backupName: detail.dataFile,
            };

            if (!(await electron.existsMetaMaskWalletBackup(args))) {
                message.errorIntl('vault.metaMaskRawData.msg.noDataFile');
            } else {
                setMnemonicRevealVisible(true);
            }
        };
        const icon = <Brain theme="outline" />;
        const label = <FormattedMessage id="wallet.mnemonicReveal.menu" />;
        const key = 'wallet.mnemonicReveal';
        return { icon, onClick, label, key };
    };

    const menuRenders = useMemo(() => {
        const { item } = props;
        if (!item) return [];
        const all: MenuRender<Item>[] = [renderEdit, renderFav];
        if (item.type === VaultItemType.Login) all.unshift(renderOpenBrowser);
        if (item.isDomainItem) {
            if (item.canAssign) {
                all.push(renderAssign);
            }
        } else {
            all.push(renderDelete);
        }
        if (isWalletType(item)) {
            all.push(renderWalletExplorer);
            all.push(renderWalletDetail);
            if (item.type === VaultItemType.MetaMaskRawData) {
                all.push(renderRecover);
                all.push(renderExportMnemonic);
            }
        }
        return all;
    }, [props.item]);

    return (
        <>
            {props.item && (
                <GeneralMore
                    extraAction={props.extraAction}
                    showPin={props.showPin}
                    data={props.item}
                    menuRenders={menuRenders}
                    menuKey={props.item.type.toString()}
                ></GeneralMore>
            )}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {walletDetailVisible && props.item && (
                    <WalletDetailList
                        loadToken={true}
                        item={props.item}
                        onClose={() => {
                            setWalletDetailVisible(false);
                        }}
                    ></WalletDetailList>
                )}

                {walletExplorerVisible && props.item && (
                    <WalletDetailList
                        loadToken={false}
                        item={props.item}
                        onClose={() => {
                            setWalletExplorerVisible(false);
                        }}
                    ></WalletDetailList>
                )}

                {walletRecoverVisible && props.item && (
                    <MetaMaskRecover
                        item={props.item}
                        onClose={() => {
                            setWalletRecoverVisible(false);
                        }}
                    ></MetaMaskRecover>
                )}

                {mnemonicRevealVisible && props.item && (
                    <MetaMaskExtract
                        item={props.item}
                        onClose={() => {
                            setMnemonicRevealVisible(false);
                        }}
                    ></MetaMaskExtract>
                )}
            </div>
        </>
    );
};

const More = memo(MoreMenu, (pre, next) => {
    return pre.item === next.item;
});

export default More;
