import { IconMap as map } from '@/components/MenuIcon';
import { VaultItemType } from '@/services/api/vaultItems';

const IconMap = (type: VaultItemType, size: number) => {
    switch (type) {
        case VaultItemType.Login: {
            const Icon = map['apps'];
            return <Icon fill="#be94f0" size={size} />;
        }
        case VaultItemType.SecureNodes: {
            const Icon = map['secureNote'];
            return <Icon fill="#efb271" size={size} />;
        }
        case VaultItemType.CreditCard: {
            const Icon = map['creditCard'];
            return <Icon fill="#b4d988" size={size} />;
        }
        case VaultItemType.PersonalInfo: {
            const Icon = map['personalInfo'];
            return <Icon fill="#f77878" size={size} />;
        }
        case VaultItemType.MetaMaskMnemonicPhrase: {
            const Icon = map['mnemonicPhrase'];
            return <Icon fill="#80b4f0" size={size} />;
        }
        case VaultItemType.Addresses: {
            const Icon = map['cryptoAddress'];
            return <Icon fill="#59d7c5" size={size} />;
        }
        case VaultItemType.MetaMaskRawData: {
            const foxImg = (
                <img style={{ width: size, height: size }} src="./icons/foxwallet.svg" />
            );
            return foxImg;
        }
        default:
            return <></>;
    }
};

export default IconMap;
