import { FormattedMessage, useModel } from 'umi';
import { Item } from '@/pages/Home/datatypes';
import GeneralMore from '@/components/GeneralMore';
import { MenuRender } from '@/components/GeneralMore';
import { UnorderedListOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { MetaMaskRawDataDetail, VaultItemType } from '@/services/api/vaultItems';
import { Brain, MenuUnfold, Redo, Edit } from '@icon-park/react';
import message from '@/utils/message';
import MetaMaskRecover from './MetaMaskRecover';
import MetaMaskExtract from './WalletMnemonicReveal';
import WalletDetailList from './WalletDetailList';
import { memo } from 'react';
import useMore from '@/pages/Home/components/More/useMore';

export type Props = {
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
    const { initialState } = useModel('@@initialState');
    const [walletDetailVisible, setWalletDetailVisible] = useState(false);
    const [walletExplorerVisible, setWalletExplorerVisible] = useState(false);
    const [walletRecoverVisible, setWalletRecoverVisible] = useState(false);
    const [mnemonicRevealVisible, setMnemonicRevealVisible] = useState(false);

    const { renderOpenBrowser, renderFav, renderDelete } = useMore(props);

    const renderEdit = (item: Item) => {
        const icon = <Edit />;
        const label = <FormattedMessage id="common.menu.edit" />;
        const onClick = () => {
            props.onEdit(true);
        };
        const key = 'edit';
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
        all.push(renderDelete);
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
