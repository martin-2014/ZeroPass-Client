import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { CsvObject } from '@/utils/csv';
import { createObjectCsvStringifier } from 'csv-writer';

export interface FieldInfo<T> {
    name: keyof T;
    csvHeader: string;
    isRequire?: boolean;
    hint?: string;
}

export interface ItemCsvParser {
    requiredHeaders: string[];
    csvNameMap: Record<string, string>;
    parseItems: (csvObject: CsvObject[]) => Promise<Message.VaultItem[]>;
    parseCsvObjects: (items: Message.VaultItem[]) => Promise<CsvObject[]>;
    csvSample: string;
}

const csvHeaderToObjPropMap = <T>(fields: FieldInfo<T>[]) => {
    return fields.reduce((pre, cur) => {
        pre[cur.csvHeader ?? cur.name.toString()] = cur.name;
        return pre;
    }, {} as Record<string, keyof T>);
};

const objPropToCsvHeaderToMap = <T>(fields: FieldInfo<T>[]) => {
    return fields.reduce((pre, cur) => {
        pre[cur.name.toString()] = cur.csvHeader;
        return pre;
    }, {} as Record<keyof T, string>);
};

export abstract class ItemParser<T> implements ItemCsvParser {
    private fields: FieldInfo<T>[];

    constructor(fields: FieldInfo<T>[]) {
        this.fields = fields;
    }

    public get requiredHeaders() {
        return this.fields.filter((f) => f.isRequire === true).map((f) => f.csvHeader);
    }

    public get csvNameMap() {
        return this.fields.reduce((map, f) => {
            map[f.name.toString()] = f.csvHeader;
            return map;
        }, {} as Record<string, string>);
    }

    public get csvSample() {
        const header = this.fields.map((f) => ({
            id: f.name.toString(),
            title: f.csvHeader ?? f.name.toString(),
        }));
        const writer = createObjectCsvStringifier({ header: header });
        const sample = this.fields.reduce((obj, f) => {
            obj[f.name.toString()] = f.hint ?? '';
            return obj;
        }, {});
        return `${writer.getHeaderString()}${writer.stringifyRecords([sample])}`;
    }

    public parseItems(csvObjects: CsvObject[]): Promise<Message.VaultItem[]> {
        const cryptoService = new TCryptoService();
        return Promise.all(csvObjects.map((csv) => this.parseItem(csv, cryptoService)));
    }

    public parseCsvObjects(items: Message.VaultItem[]): Promise<CsvObject[]> {
        const cryptoService = new TCryptoService();
        return Promise.all(items.map((item) => this.parseCsvObject(item, cryptoService)));
    }

    protected abstract parseItem(
        csvObject: CsvObject,
        cryptoService: TCryptoService,
    ): Promise<Message.VaultItem>;

    protected abstract parseCsvObject(
        item: Message.VaultItem,
        cryptoService: TCryptoService,
    ): Promise<CsvObject>;

    protected mapObjectProps(csvObject: CsvObject): T {
        const fieldsMap = csvHeaderToObjPropMap(this.fields);
        return Object.keys(csvObject).reduce((res, header) => {
            res[fieldsMap[header]] = csvObject[header] as any;
            return res;
        }, {} as T);
    }

    protected mapCsvHeaders(item: T): CsvObject {
        const fieldsMap = objPropToCsvHeaderToMap(this.fields);
        return Object.keys(item).reduce((res, prop) => {
            res[fieldsMap[prop]] = item[prop] as any;
            return res;
        }, {} as CsvObject);
    }
}
