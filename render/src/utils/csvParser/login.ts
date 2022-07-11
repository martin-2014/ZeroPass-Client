import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { LoginDetail, VaultItemType } from '@/services/api/vaultItems';
import { CsvObject } from '@/utils/csv';
import { FieldInfo, ItemParser } from './base';

export interface LoginItem extends CsvObject {
    name: string;
    username: string;
    password: string;
    url: string;
    oneTimePassword: string;
    note: string;
}

const fields: FieldInfo<LoginItem>[] = [
    {
        name: 'name',
        csvHeader: 'name',
        isRequire: true,
        hint: '[your title]',
    },
    {
        name: 'url',
        csvHeader: 'url',
        isRequire: true,
        hint: '[your login page url]',
    },
    {
        name: 'username',
        csvHeader: 'username',
        isRequire: true,
        hint: '[your login name]',
    },
    {
        name: 'password',
        csvHeader: 'password',
        isRequire: true,
        hint: '[your password]',
    },
    {
        name: 'oneTimePassword',
        csvHeader: 'oneTimePassword',
        hint: '[your one time password]',
    },
    {
        name: 'note',
        csvHeader: 'note',
        hint: '[your note]',
    },
];

class LoginParser extends ItemParser<LoginItem> {
    protected async parseItem(csvObject: CsvObject, cryptoService: TCryptoService) {
        const csvItem = super.mapObjectProps(csvObject);
        const entryptedPwd = await cryptoService.encryptText(csvItem.password, true);
        const entryptedOneTimePwd = csvItem.oneTimePassword
            ? await cryptoService.encryptText(csvItem.oneTimePassword, true)
            : null;
        const item: Message.VaultItem = {
            type: VaultItemType.Login,
            name: csvItem.name,
            description: csvItem.username,
            detail: {
                loginUser: csvItem.username,
                loginUri: csvItem.url,
                loginPassword: entryptedPwd,
                oneTimePassword: entryptedOneTimePwd,
                note: csvItem.note,
                passwordUpdateTime: new Date().toISOString(),
            },
            tags: [],
        };
        return item;
    }

    protected async parseCsvObject(item: Message.VaultItem, cryptoService: TCryptoService) {
        const detail = item.detail as LoginDetail;
        const password = await cryptoService.decryptText(detail.loginPassword, true);
        const oneTimePassword = detail.oneTimePassword
            ? await cryptoService.decryptText(detail.oneTimePassword, true)
            : '';
        const csvItem: LoginItem = {
            name: item.name,
            username: detail.loginUser,
            password: password,
            url: detail.loginUri,
            oneTimePassword: oneTimePassword,
            note: detail.note,
        };

        return super.mapCsvHeaders(csvItem);
    }
}

const parse = new LoginParser(fields);

export default parse;
