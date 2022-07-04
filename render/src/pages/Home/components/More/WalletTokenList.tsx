import SimpleModal from '@/components/SimpleModal';
import useWindowSize from '@/hooks/useWindowSize';
import { Switch, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { FormattedMessage, useIntl } from 'umi';
import { formatCurrency, formatFixedNumber } from '@/utils/formatter';
import { useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { FixedNumber } from 'ethers';
import Icon from '../Icon';
import { getTokenIcon } from '@/services/api/cryptos';
import styles from './WalletTokenList.less';
import { TokenDetailItem, wallet, WalletAccount } from '@/services/api/wallet';
import { walletConfigs } from '@/services/api/walletConfigs';
import { fixedNumberSorter, sumValues } from '@/utils/fixedNumber';

type TokenListProps = {
    account: WalletAccount;
    onClose: () => void;
    loadToken: boolean;
};

type TokenOverview = {
    netWorthInUSD: FixedNumber | null;
    netWorthInCoin: FixedNumber | null;
    totalChanged24HourPercent: FixedNumber | null;
    erc20Count: number | null;
    erc721Count: number | null;
};

const getImgUri = (address: string, network: MetaMask.Network) => {
    const res = getTokenIcon(address);
    if (res !== undefined) {
        return res;
    }
    return `./icons/${walletConfigs.value[network].defaultTokenIcon}`;
};

export default (props: TokenListProps) => {
    const Intl = useIntl();
    const { width, height } = useWindowSize();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [hideZero, setHideZero] = useState(false);
    const [accountItem, setAccountItem] = useState<WalletAccount>();
    const isMounted = useRef(false);
    const isCanceled = () => !isMounted.current;

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const { account, loadToken } = props;
        const loadTokens = async () => {
            setLoading(true);
            const tokens = await wallet.getAccountTokens(
                account.address,
                account.network,
                isCanceled,
            );
            if (tokens.skip) return;
            const tokenValue = sumValues(tokens.map((t) => t.value));
            setAccountItem({ ...account, tokens, tokenValue });
            setLoading(false);
        };

        if (!loadToken) {
            setAccountItem(account);
        } else {
            loadTokens();
        }
    }, [props.account, props.loadToken]);

    const overview: TokenOverview = useMemo(() => {
        const netWorthInUSD = accountItem?.tokenValue || null;
        const netWorthInCoin =
            accountItem?.price && accountItem.tokenValue && !accountItem.price.isZero()
                ? accountItem.tokenValue.divUnsafe(accountItem.price)
                : null;
        const totalYesterday = sumValues(
            (accountItem?.tokens ?? [])
                .filter((t) => t.value)
                .map((t) => {
                    return t.changed24Hour === null
                        ? t.value
                        : t.value!.divUnsafe(FixedNumber.from(1).addUnsafe(t.changed24Hour!));
                }),
        );
        const totalChanged24HourPercent =
            netWorthInUSD && totalYesterday && !netWorthInUSD.isZero()
                ? netWorthInUSD.subUnsafe(totalYesterday).divUnsafe(totalYesterday)
                : null;
        const erc20Count = accountItem?.tokens
            ? accountItem.tokens.filter((t) => t.type === 'ERC20').length
            : null;
        const erc721Count = accountItem?.tokens
            ? accountItem.tokens.filter((t) => t.type === 'ECR721').length
            : null;
        return {
            netWorthInUSD,
            netWorthInCoin,
            totalChanged24HourPercent,
            erc20Count,
            erc721Count,
        };
    }, [accountItem]);

    const columns: ColumnsType<TokenDetailItem> = [
        {
            title: Intl.formatMessage({ id: 'token.details.tokenName' }),
            ellipsis: true,
            width: 150,
            render: (_, record) => (
                <div style={{ display: 'flex' }}>
                    <Icon
                        size={22}
                        src={`${getImgUri(record.contract, accountItem?.network ?? 'bsc')}`}
                    />
                    <div style={{ overflow: 'hidden', marginLeft: 5 }}>
                        <Typography.Text ellipsis={{ tooltip: record.name }}>
                            {record.name}
                        </Typography.Text>
                    </div>
                </div>
            ),
        },
        {
            title: Intl.formatMessage({ id: 'token.details.symbol' }),
            dataIndex: 'symbol',
            ellipsis: true,
            width: 80,
        },
        {
            title: Intl.formatMessage({ id: 'token.details.contractAddress' }),
            dataIndex: 'contract',
            ellipsis: true,
            width: 300,
        },
        {
            title: Intl.formatMessage({ id: 'token.details.quantity' }),
            dataIndex: 'balance',
            ellipsis: true,
            sorter: (a, b) => a.balance.subUnsafe(b.balance).toUnsafeFloat(),
            render: (_, record) => formatFixedNumber(record.balance),
        },
        {
            title: Intl.formatMessage({ id: 'token.details.price' }),
            dataIndex: 'price',
            ellipsis: true,
            sorter: (a, b) => fixedNumberSorter(a.price, b.price),
            render: (_, record) => (record.price ? `$${formatFixedNumber(record.price)}` : '-'),
        },
        {
            title: Intl.formatMessage({ id: 'token.details.changed24H' }),
            dataIndex: 'change24Hour',
            ellipsis: true,
            render: (_, record) =>
                record.changed24Hour
                    ? `${(record.changed24Hour.toUnsafeFloat() * 100).toFixed(2).toString()}%`
                    : '-',
        },
        {
            title: Intl.formatMessage({ id: 'token.details.value' }),
            dataIndex: 'value',
            ellipsis: true,
            sorter: (a, b) => fixedNumberSorter(a.value, b.value),
            render: (_, record) => {
                return record.value ? formatCurrency(record.value) : '-';
            },
        },
    ];

    const filteredListData = useMemo(() => {
        let result = accountItem?.tokens;
        if (search) {
            result = result?.filter(
                (t) =>
                    t.name.toLowerCase().includes(search) ||
                    t.symbol.toLowerCase().includes(search) ||
                    t.contract.toLowerCase().includes(search),
            );
        }
        if (hideZero) {
            result = result?.filter(
                (t) =>
                    t.type === 'ECR721' ||
                    (t.value && Number(t.value.toUnsafeFloat().toFixed(2)) > 0),
            );
        }
        return result?.sort((a, b) => -fixedNumberSorter(a.value, b.value)) || [];
    }, [accountItem, search, hideZero]);

    return (
        <SimpleModal
            title={<FormattedMessage id="wallet.token.title" />}
            footer={null}
            width={Math.max(800, width - 50)}
            close={props.onClose}
        >
            <>
                <div className={styles.headerContainer}>
                    <div className={styles.header}>
                        <span>
                            <FormattedMessage id="wallet.address" />
                        </span>
                        <span className={styles.formTitleDescription}>
                            <Typography.Text ellipsis>{accountItem?.address}</Typography.Text>
                        </span>
                    </div>
                    <div className={styles.overviewContainer}>
                        <div className={styles.overviewItem}>
                            <div>
                                <Typography.Text ellipsis={true}>
                                    <FormattedMessage id="token.details.netWorthInUSD" />
                                </Typography.Text>
                            </div>
                            <div className={styles.overviewNumber}>
                                <Icon src="./icons/dollar.png" style={{ marginRight: '5px' }} />
                                <div style={{ overflow: 'hidden' }}>
                                    <Typography.Text
                                        ellipsis={{
                                            tooltip: `${formatCurrency(
                                                overview.netWorthInUSD,
                                                'noSymbol',
                                            )}`,
                                        }}
                                    >
                                        {formatCurrency(overview.netWorthInUSD, 'noSymbol')}
                                    </Typography.Text>
                                </div>
                            </div>
                        </div>
                        <div className={styles.overviewItem}>
                            <div>
                                <Typography.Text ellipsis={true}>
                                    <FormattedMessage id="token.details.netWorthInCoin" />
                                    {` ${walletConfigs.getSymbol(
                                        accountItem?.network || 'etherenum',
                                    )}`}
                                </Typography.Text>
                            </div>
                            <div className={styles.overviewNumber} style={{ overflow: 'hidden' }}>
                                <Typography.Text ellipsis={true}>
                                    {formatFixedNumber(overview.netWorthInCoin)}
                                </Typography.Text>
                            </div>
                        </div>
                        <div className={styles.overviewItem}>
                            <div>
                                <Typography.Text ellipsis={true}>
                                    <FormattedMessage id="tokens.details.totalChanged24H" />
                                </Typography.Text>
                            </div>
                            <div className={styles.overviewNumber}>
                                {overview.totalChanged24HourPercent && (
                                    <Icon
                                        src={`./icons/${
                                            overview.totalChanged24HourPercent?.isNegative()
                                                ? 'down'
                                                : 'up'
                                        }.png`}
                                        style={{ marginRight: '5px' }}
                                    />
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                    <Typography.Text ellipsis={true}>
                                        {overview.totalChanged24HourPercent
                                            ? `${(
                                                  overview.totalChanged24HourPercent.toUnsafeFloat() *
                                                  100
                                              ).toFixed(2)}%`
                                            : '-'}
                                    </Typography.Text>
                                </div>
                            </div>
                        </div>
                        <div className={styles.overviewItem}>
                            <div>
                                <Typography.Text ellipsis={true}>
                                    <FormattedMessage id="tokens.details.erc20TokenCount" />
                                    {` (${overview.erc20Count ?? '-'})`}
                                </Typography.Text>
                            </div>
                            <div className={styles.overviewNumber}>
                                <Icon src="./icons/dollar.png" style={{ marginRight: '5px' }} />
                                <div style={{ overflow: 'hidden' }}>
                                    <Typography.Text ellipsis={true}>
                                        {formatCurrency(overview.netWorthInUSD, 'noSymbol')}
                                    </Typography.Text>
                                </div>
                            </div>
                        </div>
                        <div className={styles.overviewItem}>
                            <div>
                                <Typography.Text ellipsis={true}>
                                    <FormattedMessage id="tokens.details.erc721TokenCount" />
                                    {` (${overview.erc721Count ?? '-'})`}
                                </Typography.Text>
                            </div>
                            <div className={styles.overviewNumber}>{'-'}</div>
                        </div>
                    </div>
                    <div className={styles.filterContainer}>
                        <div className={styles.searchContainer}>
                            <SearchBar
                                onChange={(e) => setSearch(e.target.value?.toLowerCase())}
                            ></SearchBar>
                        </div>
                        <div>
                            <span style={{ marginRight: '5px', fontSize: '12px' }}>
                                <FormattedMessage id="token.details.hideZeroAssets" />
                            </span>
                            <Switch
                                size="small"
                                checked={hideZero}
                                onChange={() => setHideZero((pre) => !pre)}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.tokenTable} style={{ height: height - 260 }}>
                    <Table
                        dataSource={filteredListData}
                        columns={columns}
                        loading={loading}
                        pagination={{
                            defaultPageSize: 20,
                            total: filteredListData.length,
                            showTotal: (total, range) =>
                                Intl.formatMessage(
                                    { id: 'pageOfTotalItems' },
                                    { total: total, start: range[0], end: range[1] },
                                ),
                        }}
                        scroll={{ y: height - 260 - 90 }}
                    ></Table>
                </div>
            </>
        </SimpleModal>
    );
};
