import { FormattedMessage, useModel } from 'umi';
import Popconfirm from '@/components/Popconfirm';
import { Item } from '@/pages/Home/datatypes';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { useList } from '@/pages/Home/Context/hooks';
import { useRef } from 'react';
import { OpenDefaultBrowser } from '@/components/Actions';
import { localStore } from '@/browserStore/store';
import { Delete } from '@/Icons';
import { MetaMaskRawDataDetail, VaultItemType, VaultItemView } from '@/services/api/vaultItems';
import useTagList from '@/hooks/useTagList';
import { Props } from './index';

export default (props: Props) => {
    const { personal, selectedId, setSelectedId } = useList();
    const openRef = useRef(null);
    const { initialState } = useModel('@@initialState');
    const { setNewTag } = useTagList();

    const renderOpenBrowser = (item: Item) => {
        let icon = (
            <OpenDefaultBrowser
                type="personal"
                appId={item.key}
                domainId={localStore.personalDomainId}
                action="fill"
                ref={openRef}
                noTips={true}
            />
        );

        const label = <FormattedMessage id="common.menu.open" />;
        const onClick = () => {
            openRef?.current?.onClick();
        };

        const key = 'openBrowser';
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
                personal.favourite(item.key);
            } else {
                personal.unfavourite(item.key);
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

    return { renderOpenBrowser, renderFav, renderDelete };
};
