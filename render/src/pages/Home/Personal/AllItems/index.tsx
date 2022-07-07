import { getAllItems, VaultItemType } from '../../../../services/api/vaultItems';
import { FormattedMessage, useIntl } from 'umi';
import AppList from '../../components/AppList';
import { ListContexProvider } from '../../Context/ListContext';
import { itemRequesters } from '../../requesters';
import { IconMap } from '../../../../components/MenuIcon';

const requesters = {
    ...itemRequesters,
    load: getAllItems,
};

export default (props: any) => {
    const intl = useIntl();

    return (
        <ListContexProvider requesters={requesters} containsWork={true}>
            <AppList
                {...props}
                addableItemTypes={[
                    VaultItemType.Login,
                    VaultItemType.MetaMaskRawData,
                    VaultItemType.MetaMaskMnemonicPhrase,
                    VaultItemType.Addresses,
                    VaultItemType.SecureNodes,
                    VaultItemType.CreditCard,
                    VaultItemType.PersonalInfo,
                ]}
                title={<FormattedMessage id="vault.home.title.logins" />}
                subMemus={[
                    {
                        title: intl.formatMessage({ id: 'vault.home.title.wallet' }),
                        icon: IconMap['cryptoWallet'],
                        fill: '#f77878',
                        include: [
                            VaultItemType.MetaMaskRawData,
                            VaultItemType.MetaMaskMnemonicPhrase,
                        ],
                    },
                ]}
            />
        </ListContexProvider>
    );
};
