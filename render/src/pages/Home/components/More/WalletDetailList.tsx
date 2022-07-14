import useWindowSize from '@/hooks/useWindowSize';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import {
    AddressesDetail,
    MetaMaskMnemonicPhraseDetail,
    MetaMaskRawDataDetail,
    VaultItemType,
    VaultItemView,
} from '@/services/api/vaultItems';
import { OpenUrlByBrowser } from '@/utils/tools';
import { AppstoreOutlined } from '@ant-design/icons';
import { InputNumber, Select, Space, Table, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl, useModel } from 'umi';
import WalletTokenList from './WalletTokenList';
import { FixedNumber } from 'ethers';
import { generateEtherAccounts, wallet, WalletAccount } from '@/services/api/wallet';
import HubButton from '@/components/HubButton';
import { formatCurrency, formatFixedNumber } from '@/utils/formatter';
import FullForm from '@/components/FullForm';
import SearchBar from '@/components/SearchBar';
import styles from './WalletDetailList.less';
import { Item } from '../../datatypes';
import Icon from '../Icon';
import More from '@/components/GeneralMore';
import { walletConfigs } from '@/services/api/walletConfigs';
import { fixedNumberSorter, sumValues } from '@/utils/fixedNumber';
import { Share } from '@icon-park/react';

type WalletOverview = {
    totalBalance: FixedNumber;
    totalBalanceValue: FixedNumber | null;
    totalTokenCount: number | null;
    totalTokenValue: FixedNumber | null;
};

const networkOptions = walletConfigs.networks.map((n) => {
    return { label: n.name, value: n.network };
});

const networkChains: MetaMask.NetworkChain[] = walletConfigs.networks.map((n) => {
    return { id: n.chainId, network: n.network };
});

const getItemTypeDescription = (type: VaultItemType | undefined) => {
    if (type === VaultItemType.MetaMaskMnemonicPhrase)
        return 'vault.home.title.MetaMaskMnemonicPhrase';
    if (type === VaultItemType.MetaMaskRawData) return 'vault.metaMaskRawData.title';
    if (type === VaultItemType.Addresses) return 'vault.home.title.addresses';
    return '';
};

export default (props: { onClose: () => void; item?: Item; loadToken: boolean }) => {
    const { height } = useWindowSize();
    const [loading, setLoading] = useState<boolean>(false);
    const [network, setNetwork] = useState<MetaMask.Network>('etherenum');
    const [walletAccountList, setWalletAccountList] = useState<WalletAccount[]>([]);
    const [walletTokenListVisible, setWalletTokenListVisible] = useState<boolean>(false);
    const [currentWalletAccount, setCurrentWalletAccount] = useState<WalletAccount>();
    const { initialState } = useModel('@@initialState');
    const Intl = useIntl();
    const { item: selectedItem } = props;
    const showMoreInputRef = useRef<any>(null);
    const showMoreRows = selectedItem?.type === VaultItemType.MetaMaskMnemonicPhrase;
    const isMounted = useRef(false);
    const isCanceled = () => !isMounted.current;
    const [search, setSearch] = useState('');

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const FormTitle = useMemo(() => {
        const typeDescription = getItemTypeDescription(selectedItem?.type);
        const translated = typeDescription ? <FormattedMessage id={typeDescription} /> : '';
        return (
            <div style={{ display: 'flex', overflow: 'hidden' }}>
                <Typography.Text ellipsis={true}>{selectedItem?.title}</Typography.Text>
                <div className={styles.formTitleDescription}>{translated}</div>
            </div>
        );
    }, [selectedItem]);

    const loadWalletAccountList = async (reload: boolean = true) => {
        setLoading(true);
        const getWalletAccounts = props.loadToken ? wallet.getAccountAndTokens : wallet.getAccounts;
        const item = selectedItem!;
        let accountList: WalletAccount[] = [];
        if (item.type === VaultItemType.Addresses) {
            const cryptoService = new TCryptoService();
            const plainContent = await cryptoService.decryptText(item.detail.content, true);
            const detail: AddressesDetail = JSON.parse(plainContent);
            const result = await getWalletAccounts(
                detail.addresses.map((add) => add.address),
                network,
                isCanceled,
            );
            if (result.skip) return;
            accountList = result;
        } else if (item.type === VaultItemType.MetaMaskRawData) {
            const itemView = item as VaultItemView<MetaMaskRawDataDetail>;
            const accounts = await electron.getMetaMaskWalletAccountsFromDb({
                userId: initialState?.currentUser?.id!,
                backupName: itemView.detail.dataFile,
                networkChain: networkChains,
            });
            let result = await getWalletAccounts(
                accounts.map((account) => account.address),
                network,
                isCanceled,
            );
            if (result.skip) return;
            accountList = result.map((w) => ({
                ...w,
                addressWithName: `${w.address} (${
                    accounts.find((a) => a.address === w.address)?.name
                })`,
            }));
        } else if (item.type === VaultItemType.MetaMaskMnemonicPhrase) {
            const cryptoService = new TCryptoService();
            const plainContent = await cryptoService.decryptText(item.detail.content, true);
            const detail: MetaMaskMnemonicPhraseDetail = JSON.parse(plainContent);
            const start = reload ? 0 : walletAccountList.length;
            const moreRows = Number(showMoreInputRef.current?.value);
            if (moreRows <= 0) return;
            const accounts = await generateEtherAccounts(detail.mnemonicPhrase, moreRows, start);
            const result = await getWalletAccounts(
                accounts.map((account) => account.address),
                network,
                isCanceled,
            );
            if (result.skip) return;
            accountList = result;
        }

        if (isMounted.current) {
            if (item.type === VaultItemType.MetaMaskMnemonicPhrase) {
                accountList = reload ? accountList : [...walletAccountList, ...accountList];
            }
            setWalletAccountList(accountList);
        }
        setLoading(false);
    };

    useEffect(() => {
        setWalletAccountList([]);
        if (!selectedItem) {
            return;
        }
        const loadDetails = async () => {
            await loadWalletAccountList();
        };
        loadDetails();
    }, [network, selectedItem]);

    const allListData: WalletAccount[] = useMemo(() => {
        return walletAccountList.sort((a, b) => -fixedNumberSorter(a.value, b.value));
    }, [walletAccountList]);

    const walletOverview: WalletOverview = useMemo(() => {
        return {
            totalBalance: sumValues(walletAccountList.map((d) => d.balance))!,
            totalBalanceValue: sumValues(walletAccountList.map((d) => d.value)),
            totalTokenCount: walletAccountList.reduce((count, cur) => {
                const { tokens = null } = cur;
                if (tokens === null) return count;
                return Number(count) + tokens.length;
            }, null as null | number),
            totalTokenValue: sumValues(
                walletAccountList.map((d) => {
                    const { tokenValue = null } = d;
                    return tokenValue;
                }),
            ),
        };
    }, [walletAccountList]);

    const filteredListData: WalletAccount[] = useMemo(() => {
        if (!search) return allListData;
        return allListData.filter((d) => d.address.toLowerCase().includes(search));
    }, [allListData, search]);

    const renderMore = useCallback((data: WalletAccount, network: MetaMask.Network) => {
        const firstMenu = (d: WalletAccount) => {
            const icon = <Share />;
            const onClick = () => {
                OpenUrlByBrowser.default(walletConfigs.getOnlineUrl(d.address, network));
            };
            const label = (
                <div>
                    <FormattedMessage id="wallet.viewAccount" />{' '}
                    {walletConfigs.getNetworkName(network)}
                </div>
            );
            const key = 'wallet.viewAccount';
            return { icon, onClick, label, key };
        };

        const secondMenu = (d: WalletAccount) => {
            const icon = <AppstoreOutlined />;
            const onClick = () => {
                setCurrentWalletAccount(d);
                setWalletTokenListVisible(true);
            };
            const label = (
                <div>
                    <FormattedMessage id="wallet.tokenDetails" />{' '}
                    {walletConfigs.getNetworkName(network)}
                </div>
            );

            const key = 'wallet.tokenDetails';
            return { icon, onClick, label, key };
        };
        return (
            <More
                menuKey="wallet-detail"
                showPin={true}
                data={data}
                menuRenders={[firstMenu, secondMenu]}
            />
        );
    }, []);

    const getColumns = () => {
        const columns: ColumnsType<WalletAccount> = [
            {
                title: '#',
                ellipsis: true,
                width: 50,
                render: (value: any, item: WalletAccount, index: number) => index + 1,
            },
            {
                title: Intl.formatMessage({ id: 'wallet.address' }),
                ellipsis: true,
                width: '40%',
                render: (
                    value: any,
                    item: WalletAccount & { addressWithName?: string },
                    index: number,
                ) => item.addressWithName || item.address,
            },
            {
                title: Intl.formatMessage({ id: 'wallet.balance' }),
                sorter: (a, b) => fixedNumberSorter(a.balance, b.balance),
                width: '20%',
                ellipsis: true,
                render: (data: WalletAccount) => {
                    const text = `${formatFixedNumber(data.balance)} ${walletConfigs.getSymbol(
                        data.network,
                    )}`;
                    return text;
                },
            },
            {
                title: Intl.formatMessage({ id: 'wallet.value' }),
                sorter: (a, b) => fixedNumberSorter(a.value, b.value),
                ellipsis: true,
                width: '20%',
                render: (data: WalletAccount) => formatCurrency(data.value),
            },
        ];
        if (props.loadToken) {
            columns.push({
                title: Intl.formatMessage({ id: 'wallet.token' }),
                width: '20%',
                sorter: (a, b) => fixedNumberSorter(a.tokenValue!, b.tokenValue!),
                render: (data: WalletAccount) => {
                    return (
                        <div style={{ display: 'flex' }}>
                            <div style={{ marginRight: '5px', overflow: 'hidden' }}>
                                <Typography.Text
                                    ellipsis={{ tooltip: formatCurrency(data.tokenValue!) }}
                                >
                                    {formatCurrency(data.tokenValue!)}
                                </Typography.Text>
                            </div>
                            <Tooltip
                                title={`${data.tokens?.length ?? '-'} ${Intl.formatMessage({
                                    id: 'wallet.token.totalContract',
                                })}`}
                            >
                                <span className={styles.tokenSumCount}>
                                    {data.tokens?.length ?? '-'}
                                </span>
                            </Tooltip>
                        </div>
                    );
                },
            });
        }
        columns.push({
            render: (data: WalletAccount) => {
                return renderMore(data, network);
            },
            width: 100,
        });
        return columns;
    };

    return (
        <>
            <FullForm visible={true} title={FormTitle} onClose={props.onClose}>
                <>
                    <div className={styles.headerContainer}>
                        <div className={styles.overviewContainer}>
                            <div className={styles.overviewItem}>
                                <div>
                                    <FormattedMessage id="wallet.details.currentChain" />
                                </div>
                                <div className={styles.overviewNumber}>
                                    <Select
                                        size="small"
                                        className={styles.networkSelect}
                                        value={network}
                                        onChange={setNetwork}
                                        options={networkOptions}
                                    />
                                </div>
                            </div>
                            <div className={styles.overviewItem}>
                                <div>
                                    <FormattedMessage id="wallet.details.totalValue" />
                                </div>
                                <div className={styles.overviewNumber}>
                                    <Icon src="./icons/dollar.png" style={{ marginRight: '5px' }} />
                                    <div style={{ overflow: 'hidden' }}>
                                        <Typography.Text
                                            ellipsis={{
                                                tooltip: formatCurrency(
                                                    walletOverview.totalBalanceValue,
                                                    'noSymbol',
                                                ),
                                            }}
                                        >
                                            {formatCurrency(
                                                walletOverview.totalBalanceValue,
                                                'noSymbol',
                                            )}
                                        </Typography.Text>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.overviewItem}>
                                <div>
                                    <FormattedMessage id="wallet.details.totalBalance" />
                                </div>
                                <div className={styles.overviewNumber}>
                                    <Icon
                                        src={`./icons/${walletConfigs.getIcon(network)}`}
                                        style={{ marginRight: '5px' }}
                                    />
                                    <div style={{ overflow: 'hidden' }}>
                                        <Typography.Text
                                            ellipsis={{
                                                tooltip: formatFixedNumber(
                                                    walletOverview.totalBalance,
                                                ),
                                            }}
                                        >
                                            {formatFixedNumber(walletOverview.totalBalance)}
                                        </Typography.Text>
                                    </div>
                                </div>
                            </div>
                            {props.loadToken && (
                                <div className={styles.overviewItem}>
                                    <div>
                                        <FormattedMessage id="wallet.details.tokenInWallet" />
                                        {` (${walletOverview.totalTokenCount ?? '-'})`}
                                    </div>
                                    <div className={styles.overviewNumber}>
                                        <Icon
                                            src="./icons/dollar.png"
                                            style={{ marginRight: '5px' }}
                                        />
                                        <div style={{ overflow: 'hidden' }}>
                                            <Typography.Text
                                                ellipsis={{
                                                    tooltip: formatCurrency(
                                                        walletOverview.totalTokenValue,
                                                        'noSymbol',
                                                    ),
                                                }}
                                            >
                                                {formatCurrency(
                                                    walletOverview.totalTokenValue,
                                                    'noSymbol',
                                                )}
                                            </Typography.Text>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.searchContainer}>
                            <SearchBar
                                onChange={(e) => setSearch(e.target.value?.toLowerCase())}
                            ></SearchBar>
                        </div>
                    </div>
                    <div>
                        <Table
                            className={styles.detailTable}
                            style={{ height: showMoreRows ? height - 420 : height - 360 }}
                            scroll={{ y: showMoreRows ? height - 450 : height - 360 - 45 }}
                            columns={getColumns()}
                            dataSource={filteredListData}
                            rowKey="address"
                            loading={loading}
                            pagination={false}
                        />
                    </div>
                    {showMoreRows && (
                        <div className={styles.showMore}>
                            <InputNumber
                                ref={showMoreInputRef}
                                defaultValue={10}
                                min={1}
                                step={5}
                                max={20}
                                addonAfter={
                                    <HubButton
                                        onClick={() => {
                                            !loading && loadWalletAccountList(false);
                                        }}
                                    >
                                        {Intl.formatMessage({ id: 'wallet.details.showMore' })}
                                    </HubButton>
                                }
                            />
                        </div>
                    )}
                </>
            </FullForm>
            {walletTokenListVisible && currentWalletAccount && (
                <WalletTokenList
                    account={currentWalletAccount}
                    loadToken={!props.loadToken}
                    onClose={() => setWalletTokenListVisible(false)}
                ></WalletTokenList>
            )}
        </>
    );
};
