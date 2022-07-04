import BaseContentLayout from '@/components/BaseContentLayout';
import HubButton from '@/components/HubButton';
import List from '@/pages/Home/components/List';
import { VaultItemType } from '@/services/api/vaultItems';
import { Dropdown, Menu, Space } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { useList } from '../../Context/hooks';
import { TagsContextProvider } from '../../Context/TagsContext';
import { Item } from '../../datatypes';
import {
    EditForm as EditAddressesForm,
    NewForm as NewAddresseseForm,
} from '../CollectionOfAddresses';
import { EditForm as EditCreditCardForm, NewForm as NewCreditCardForm } from '../CreditCardForm';
import {
    EditForm as EditMetaMaskMnemonicPhraseForm,
    NewForm as NewMetaMaskMnemonicPhraseForm,
} from '../MetaMaskMnemonicPhrase';
import {
    EditForm as EditDataWalletForm,
    NewForm as NewDataWalletForm,
} from '../MetaMaskRawDataForm';
import {
    EditForm as EditPersonalInfoForm,
    NewForm as NewPersonalInfoForm,
} from '../PersonalInfoForm';
import { EditForm as EditSecureNoteForm, NewForm as NewSecureNoteForm } from '../SecureNoteForm';
import { EditForm as EditLoginForm, NewForm as NewLoginForm } from '../WorkForm';
import styles from './index.less';
import IconMap from '../IconMap';
import type { Icon } from '@icon-park/react/es/runtime';

type Props = {
    route: any;
    location: any;
    title: ReactNode;
    addableItemTypes?: VaultItemType[];
    onChange?: (data: Item[]) => void;
    filter?: (items: Item[], search: string) => Item[];
    subMemus?: SubMenu[];
};

type SubMenu = {
    icon: Icon;
    fill: string;
    title: string;
    include: VaultItemType[];
};
const size = 16;

export default (props: Props) => {
    const Intl = useIntl();
    const [newItem, setNewItem] = useState(false);
    const [newItemType, setNewItemType] = useState<VaultItemType>();
    const [editItem, setEditItem] = useState(false);
    const [editItemType, setEditItemType] = useState<VaultItemType>();
    const { addableItemTypes = [], subMemus } = props;
    const { setSelectedId, items, loadItems, setSearch, selectedId } = useList();

    const hideForm = () => {
        setSelectedId(-1);
    };

    useEffect(() => {
        hideForm();
        if (props.route.name === 'tags') {
            const pathArr = props.location.pathname.split('/');
            const len = pathArr.length;
            const id = pathArr[len - 1];
            if (id && id !== -1) {
                loadItems(id);
            }
        } else {
            loadItems();
        }
    }, [props.location.pathname]);

    const onItemSelected = (item: Item, isEdit = false) => {
        const id = item.key;
        setEditItemType(item.type);

        setNewItem(false);
        setEditItem(false);
        if (selectedId.toString() === id.toString() && !isEdit) {
            setSelectedId(-1);
        } else {
            setSelectedId(id);
        }
    };

    const onNewItem = (type: VaultItemType) => {
        console.log('new', type);
        setNewItem(true);
        setNewItemType(type);
    };

    type AddButtonType = { type: VaultItemType; title: string; icon?: JSX.Element };
    const addButtonsForTypes: AddButtonType[] = [
        {
            type: VaultItemType.Login,
            title: 'vault.login.title',
            icon: IconMap(VaultItemType.Login, size),
        },
        {
            type: VaultItemType.SecureNodes,
            title: 'vault.secureNote.title',
            icon: IconMap(VaultItemType.SecureNodes, size),
        },
        {
            type: VaultItemType.CreditCard,
            title: 'vault.creditCard.title',
            icon: IconMap(VaultItemType.CreditCard, size),
        },
        {
            type: VaultItemType.PersonalInfo,
            title: 'vault.personalInfo.title',
            icon: IconMap(VaultItemType.PersonalInfo, size),
        },
        {
            type: VaultItemType.MetaMaskRawData,
            title: 'vault.metaMaskRawData.title',
            icon: IconMap(VaultItemType.MetaMaskRawData, size),
        },
        {
            type: VaultItemType.MetaMaskMnemonicPhrase,
            title: 'vault.home.title.MetaMaskMnemonicPhrase',
            icon: IconMap(VaultItemType.MetaMaskMnemonicPhrase, size),
        },
        {
            type: VaultItemType.Addresses,
            title: 'vault.home.title.addresses',
            icon: IconMap(VaultItemType.Addresses, size),
        },
    ];

    const isSubMenu = (type: VaultItemType): [boolean, SubMenu | any] => {
        let returnSubMenu = null;
        subMemus?.forEach((subMenu) => {
            if (subMenu.include.includes(type)) {
                returnSubMenu = subMenu;
                return;
            }
        });
        return returnSubMenu == null ? [false, null] : [true, returnSubMenu];
    };

    const generateMenuItem = (type: VaultItemType) => {
        const button = addButtonsForTypes.find((btn) => btn.type === type);
        const Icon = button!.icon;
        return (
            <Menu.Item key={type}>
                <div
                    style={{ width: '100%' }}
                    onClick={() => {
                        onNewItem(type);
                    }}
                >
                    <Space size={5} className={styles.button}>
                        {Icon}
                        {<FormattedMessage id={button!.title} />}
                    </Space>
                </div>
            </Menu.Item>
        );
    };

    const generateSubMenu = (type: VaultItemType, subMenu: SubMenu) => {
        if (subMenu.include[0] === type) {
            const Icon = subMenu.icon;
            return (
                <Menu.SubMenu
                    key={subMenu.title + type}
                    title={
                        <Space size={3} className={styles.button}>
                            <Icon style={{ marginRight: 2 }} size={size} fill={subMenu.fill}></Icon>
                            <span>{subMenu.title}</span>
                        </Space>
                    }
                >
                    {subMenu.include.map((subType) => {
                        return generateMenuItem(subType);
                    })}
                </Menu.SubMenu>
            );
        } else {
            return;
        }
    };

    const getDropDownMenu = (types: VaultItemType[]) => {
        const result = (
            <Menu>
                {types.map((type) => {
                    const result = isSubMenu(type);
                    if (result[0]) {
                        return generateSubMenu(type, result[1]);
                    } else {
                        return generateMenuItem(type);
                    }
                })}
            </Menu>
        );
        return result;
    };

    const renderSingleAddButton = (type: VaultItemType) => {
        return (
            <HubButton
                style={{
                    marginLeft: '5px',
                    padding: '4px 0',
                    width: '80px',
                }}
                onClick={() => onNewItem(type)}
            >
                {'+ ' + Intl.formatMessage({ id: 'pages.searchTable.new' })}
            </HubButton>
        );
    };

    const renderMultiAddButton = (types: VaultItemType[]) => {
        return (
            <Dropdown
                overlay={() => getDropDownMenu(types)}
                placement="bottomLeft"
                trigger={['click']}
            >
                <HubButton
                    style={{
                        marginLeft: '5px',
                        padding: '4px 0',
                        width: '80px',
                    }}
                >
                    {'+ ' + Intl.formatMessage({ id: 'pages.searchTable.new' })}
                </HubButton>
            </Dropdown>
        );
    };

    const renderAddButton = () => {
        if (addableItemTypes.length === 0) return <></>;
        return addableItemTypes.length === 1
            ? renderSingleAddButton(addableItemTypes[0])
            : renderMultiAddButton(addableItemTypes);
    };

    const handleListEdit = (edit: boolean, item: Item) => {
        onItemSelected(item, edit);
        setEditItem(edit);
    };
    return (
        <BaseContentLayout
            onSearch={(e) => {
                setSearch(e.target.value);
            }}
            header={renderAddButton()}
        >
            <div style={{ height: '100%' }}>
                {items === undefined ? (
                    <div
                        style={{
                            width: 300,
                        }}
                    ></div>
                ) : (
                    <List onSelected={onItemSelected} changeEdit={handleListEdit} />
                )}
                <>
                    {
                        <TagsContextProvider>
                            {/* {hasSelected ? <></> : <EmptyForm></EmptyForm>} */}
                            {newItemType === VaultItemType.Login && newItem ? (
                                <NewLoginForm changeNew={setNewItem}></NewLoginForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.Login ? (
                                <EditLoginForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditLoginForm>
                            ) : (
                                <></>
                            )}
                            {newItemType === VaultItemType.SecureNodes && newItem ? (
                                <NewSecureNoteForm changeNew={setNewItem}></NewSecureNoteForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.SecureNodes ? (
                                <EditSecureNoteForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditSecureNoteForm>
                            ) : (
                                <></>
                            )}
                            {newItemType === VaultItemType.CreditCard && newItem ? (
                                <NewCreditCardForm changeNew={setNewItem}></NewCreditCardForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.CreditCard ? (
                                <EditCreditCardForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditCreditCardForm>
                            ) : (
                                <></>
                            )}
                            {newItemType === VaultItemType.PersonalInfo && newItem ? (
                                <NewPersonalInfoForm changeNew={setNewItem}></NewPersonalInfoForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.PersonalInfo ? (
                                <EditPersonalInfoForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditPersonalInfoForm>
                            ) : (
                                <></>
                            )}
                            {newItemType === VaultItemType.MetaMaskMnemonicPhrase && newItem ? (
                                <NewMetaMaskMnemonicPhraseForm
                                    changeNew={setNewItem}
                                ></NewMetaMaskMnemonicPhraseForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.MetaMaskMnemonicPhrase ? (
                                <EditMetaMaskMnemonicPhraseForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditMetaMaskMnemonicPhraseForm>
                            ) : (
                                <></>
                            )}
                            {newItemType === VaultItemType.MetaMaskRawData && newItem ? (
                                <NewDataWalletForm changeNew={setNewItem}></NewDataWalletForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.MetaMaskRawData && (
                                <EditDataWalletForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditDataWalletForm>
                            )}
                            {newItemType === VaultItemType.Addresses && newItem ? (
                                <NewAddresseseForm changeNew={setNewItem}></NewAddresseseForm>
                            ) : (
                                <></>
                            )}
                            {editItemType === VaultItemType.Addresses ? (
                                <EditAddressesForm
                                    editing={editItem}
                                    changeEditing={setEditItem}
                                ></EditAddressesForm>
                            ) : (
                                <></>
                            )}
                        </TagsContextProvider>
                    }
                </>
            </div>
        </BaseContentLayout>
    );
};
