import { UInt8ArrayToHexString, HexStringToUInt8Array } from './unitity/unitity';

export class SecretKey {
    private readonly version_v1: string = 'V1';
    private readonly separator: string = '-';

    private readonly _buffer: Uint8Array;

    constructor(rawContent: string | undefined = undefined) {
        if (rawContent !== undefined) {
            this._buffer = this.import(rawContent);
        } else {
            this._buffer = window.crypto.getRandomValues(new Uint8Array(16));
        }
    }

    public get buffer(): Uint8Array {
        return this._buffer;
    }

    private import(rawContent: string): Uint8Array {
        var upperRawContent = rawContent.toUpperCase();
        var hexContent = '';
        if (upperRawContent.startsWith(this.version_v1)) {
            hexContent = upperRawContent.substring(2).replace(/-/g, '');
        }

        return HexStringToUInt8Array(hexContent);
    }

    public export(): string {
        if (this._buffer === undefined) return '';

        var hexContent = UInt8ArrayToHexString(this._buffer);

        var displayHexContent = hexContent.match(/.{1,4}/gi)?.join(this.separator);

        return this.version_v1 + this.separator + displayHexContent;
    }
}
