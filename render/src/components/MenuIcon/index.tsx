import {
    DashboardOne,
    User,
    Peoples,
    AssemblyLine,
    IdCardH,
    DocSearchTwo,
    MoreTwo,
    Electrocardiogram,
    Aiming,
    Lifebuoy,
    DataServer,
    Key,
    Brain,
    BankCard,
    Wallet,
    Layers,
    SettingTwo,
    Star,
    Earth,
    TagOne,
    MapDraw,
    FolderOpen,
} from '@icon-park/react';
import CryptoAddress from './CryptoAddress';
import CryptoWallet from './CryptoWallet';

const size = 18;
export type SvgProps = {
    size?: number;
    fill?: string;
};
export const IconMap = {
    dashboard: <DashboardOne size={size} fill="#60adff" />,
    users: <User size={size} fill="#b974ff" />,
    teams: <Peoples size={size} fill="#ff5e5e" />,
    machines: <AssemblyLine size={size} fill="#6ccde0" />,
    logins: <IdCardH size={size} fill="#82ddb0" />,
    reports: <DocSearchTwo size={size} fill="#d09e68" />,
    passwordGenerator: <MoreTwo size={size} fill="#64afff" />,
    passwordHealth: <Electrocardiogram size={size} fill="#b974ff" />,
    dataBreachScanner: <Aiming size={size} fill="#ff5e5e" />,
    accountGenerator: <Lifebuoy size={size} fill="#50c4da" />,
    DataStorage: <DataServer size={size} fill="#66d69d" />,
    global: <Earth size={size} fill="#60adff" />,
    tag: <TagOne size={18}></TagOne>,
    allItems: Layers,
    apps: Key,
    secureNote: FolderOpen,
    creditCard: BankCard,
    personalInfo: IdCardH,
    cryptoWallet: CryptoWallet,
    cryptoAddress: CryptoAddress,
    adminconsole: SettingTwo,
    mnemonicPhrase: Brain,
    star: <Star fill="#ffc600" size={size} theme="filled" />,
};
