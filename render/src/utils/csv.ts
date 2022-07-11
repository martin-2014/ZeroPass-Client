import * as csvWriter from 'csv-writer';

const quote = `"`;

export const CSVToArray = (strData: string, strDelimiter: any = undefined) => {
    const arrData: string[][] = [[]];
    let header: string[] | null = null;
    for (let { rowParsed } of csvInterator(strData, strDelimiter)) {
        if (!header) {
            header = rowParsed;
        } else {
            arrData.push(rowParsed);
        }
    }
    return arrData;
};

interface ParseCsvResult {
    result: 'success' | 'partialSuccess' | 'headermissing';
    header?: string[];
    objects?: CsvObject[];
    failContent?: string;
}

export interface CsvObject {
    [prop: string]: string;
}

export const parseCsv = (strData: string, requiredHeaders: string[]): ParseCsvResult => {
    let headerRaw: string | null = null;
    let headerParsed: string[] | null = null;
    const successObjects: CsvObject[] = [];
    const failRows: string[] = [];
    for (let { rowParsed, rowRaw } of csvInterator(strData, ',')) {
        if (!headerRaw) {
            headerParsed = rowParsed;
            headerRaw = rowRaw;
            const missingHeaders = requiredHeaders.filter((h) => !rowParsed.includes(h));
            if (missingHeaders.length > 0) {
                console.log('header missing: ', missingHeaders);
                return { result: 'headermissing', header: headerParsed };
            }
        } else {
            const obj = {} as CsvObject;
            headerParsed!.forEach((header, index) => {
                obj[header] = rowParsed[index] as any;
            });
            const isAllRequired = requiredHeaders.every((h) => Object.hasOwn(obj, h) && obj[h]);
            if (isAllRequired) {
                successObjects.push(obj);
            } else {
                if (rowRaw) {
                    failRows.push(rowRaw);
                }
            }
        }
    }
    return {
        result: failRows.length === 0 ? 'success' : 'partialSuccess',
        header: headerParsed!,
        objects: successObjects,
        failContent: failRows.length === 0 ? '' : [headerRaw, ...failRows].join('\n'),
    };
};

function* csvInterator(strData: string, strDelimiter: any = undefined) {
    let rowParsed: string[] = [];
    let rowRaw = '';

    if (!strData) {
        yield { rowParsed, rowRaw };
        return;
    }

    strDelimiter = strDelimiter || ',';

    const objPattern = new RegExp(
        '(\\' +
            strDelimiter +
            '|\\r?\\n|\\r|^)' +
            // Quoted fields.
            '(?:"([^"]*(?:""[^"]*)*)"|' +
            // Standard fields.
            '([^"\\' +
            strDelimiter +
            '\\r\\n]*))',
        'gi',
    );

    let arrMatches = null;

    while ((arrMatches = objPattern.exec(strData))) {
        const strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
            yield { rowParsed, rowRaw };
            rowParsed = [];
            rowRaw = '';
        }

        let strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            const raw = `${quote}${arrMatches[2]}${quote}`;
            rowRaw = rowRaw ? [rowRaw, raw].join(strDelimiter) : raw;
            strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
        } else {
            // We found a non-quoted value.
            rowRaw = rowRaw ? [rowRaw, arrMatches[3]].join(strDelimiter) : arrMatches[3];
            strMatchedValue = arrMatches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        rowParsed.push(strMatchedValue);
    }
    yield { rowParsed, rowRaw };
}
