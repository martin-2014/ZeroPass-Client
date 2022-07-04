import Block, { Props as BlockProps } from '@/pages/Tools/PasswordHealth/Block';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.less';
import BaseContentLayout from '@/components/BaseContentLayout';
import GroupList from './GroupList';
import List from './List';
import { getPersonalItems, VaultItemType } from '@/services/api/vaultItems';
import { VaultItem } from '@/pages/Home/datatypes';
import { filterData } from '@/utils/tools';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { getIconUri } from '@/pages/Home/Context/ListContext';
import owasp from 'owasp-password-strength-test';
import { Item as WeakItem } from './List';
import { useIntl } from 'umi';
type Item = VaultItem & {
    loginPassword: string;
    title: string;
    icon: JSX.Element;
    key: string | number;
};
const getReusedData = (Items: Item[]) => {
    const data = new Map<string, Item[]>();
    Items.forEach((item) => {
        const values = data.get(item.loginPassword) || [];
        data.set(item.loginPassword, [...values, item]);
    });
    return [...data.values()].filter((item) => item.length > 1);
};
const getWeakData = (items: Item[]) => {
    const data: (Item & { passwordStrength: WeakItem['passwordStrength'] })[] = [];
    items.forEach((item) => {
        const level = 100 - owasp.test(item.loginPassword).errors.length * 20;
        if (level < 60) {
            data.push({
                ...item,
                passwordStrength: 'low',
            });
        } else if (level === 60) {
            data.push({
                ...item,
                passwordStrength: 'medium',
            });
        }
    });
    return data;
};
export default () => {
    const [sourceData, setSourceData] = useState<Item[]>();
    const isUnmounted = useRef(false);
    const [currentBlock, setCurrentBlock] = useState<BlockProps['type']>('weak');
    const [search, setSearch] = useState('');
    const Intl = useIntl();

    const load = async () => {
        const res = await getPersonalItems(VaultItemType.Login);
        if (res.fail || isUnmounted.current || !res.payload) {
            return;
        }
        const cryptoService = new TCryptoService();
        const data = [];
        for (const item of res.payload) {
            const loginPassword = await cryptoService.decryptText(item.detail.loginPassword, true);
            data.push({
                ...item,
                loginPassword,
                title: item.alias || item.name,
                icon: getIconUri(item)!,
                key: item.id,
            });
        }
        setSourceData(data);
    };
    let searchData: Item[] = [];

    if (sourceData) {
        searchData = filterData(sourceData, ['description', 'title'], search);
    }

    const reusedData = useMemo(() => {
        return getReusedData(sourceData || []);
    }, [sourceData]);

    const reusedDataBySearch = useMemo(() => {
        const data = reusedData ?? [];
        const result: Item[][] = [];
        const searchIds = searchData?.map((s) => s.id);
        data.forEach((items) => {
            const tmp = items.filter((item) => searchIds.includes(item.id));
            if (tmp.length > 0) result.push(tmp);
        });

        return result;
    }, [searchData]);

    const weakData = useMemo(() => {
        return getWeakData(sourceData || []);
    }, [sourceData]);

    const weakDataBySearch = useMemo(() => {
        return getWeakData(searchData || []);
    }, [searchData]);
    const getOldData = () => {
        const data: (Item & { timeToLive: WeakItem['timeToLive'] })[] = [];
        searchData.forEach((item) => {
            const timeDiff =
                new Date().getTime() - new Date(item.detail.passwordUpdateTime).getTime();
            const timeToLive = Math.floor(timeDiff / (24 * 3600 * 1000));
            if (timeToLive >= 90) {
                data.push({
                    ...item,
                    timeToLive,
                });
            }
        });
        return data;
    };
    const reusedPasswordSum = useMemo(() => {
        let sum = 0;
        reusedData.forEach((item) => {
            sum += item.length;
        });
        return sum;
    }, [searchData]);
    const TableList = () => {
        switch (currentBlock) {
            case 'weak':
                return <List type="weak" data={weakDataBySearch} />;
            case 'old':
                return <List type="old" data={getOldData()} />;
            case 'reused':
                return <GroupList data={reusedDataBySearch} />;
        }
    };

    const buttons: Omit<BlockProps, 'onClick' | 'selected'>[] = [
        {
            type: 'weak',
            title: Intl.formatMessage({ id: 'common.weak.passwords' }),
            sum: weakData.length,
            tip: Intl.formatMessage({ id: 'common.weak.passwords.tip' }),
        },
        {
            type: 'reused',
            title: Intl.formatMessage({ id: 'common.reused.passwords' }),
            sum: reusedPasswordSum,
            tip: Intl.formatMessage({ id: 'common.reused.passwords.tip' }),
        },
        {
            type: 'old',
            title: Intl.formatMessage({ id: 'common.old.passwords' }),
            sum: getOldData().length,
            tip: Intl.formatMessage({ id: 'common.old.passwords.tip' }),
        },
    ];

    useEffect(() => {
        isUnmounted.current = false;
        load();
        return () => {
            isUnmounted.current = true;
        };
    }, []);
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };
    return (
        <div className={styles.wrapper}>
            <div className={styles.blocks}>
                {buttons.map((item, index) => (
                    <Block
                        style={{ marginRight: '20px' }}
                        type={item.type}
                        title={item.title}
                        sum={item.sum}
                        selected={currentBlock === item.type}
                        key={item.type}
                        tip={item.tip}
                        onClick={() => {
                            setCurrentBlock(item.type);
                        }}
                    />
                ))}
            </div>
            <div className={styles.content}>
                <BaseContentLayout onSearch={handleSearch} header={<></>}>
                    <TableList></TableList>
                </BaseContentLayout>
            </div>
        </div>
    );
};
