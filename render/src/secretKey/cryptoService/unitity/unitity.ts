export function UInt8ArrayToHexString(array: Uint8Array): string {
    return Buffer.from(array).toString('hex').toUpperCase();
}

export function HexStringToUInt8Array(content: string): Uint8Array {
    return Buffer.from(content.toUpperCase(), 'hex');
}

export function ArrayBufferToHexString(arrayBuffer: ArrayBuffer): string {
    return Buffer.from(arrayBuffer).toString('hex').toUpperCase();
}

export function HexStringToArrayBuffer(content: string): ArrayBuffer {
    return Buffer.from(content.toUpperCase(), 'hex');
}

export function ArrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    return Buffer.from(arrayBuffer).toString('base64');
}

export function Base64ToArrayBuffer(base64Contents: string): ArrayBuffer {
    return Buffer.from(base64Contents, 'base64');
}

export function BufferToBase64(buffer: Buffer): string {
    return Buffer.from(buffer).toString('base64');
}

export function Base64ToBuffer(base64Contents: string): Buffer {
    return Buffer.from(base64Contents, 'base64');
}

export function StringToBase64(content: string): string {
    return Buffer.from(content).toString('base64');
}

export function Base64ToString(base64Content: string): string {
    return Buffer.from(base64Content, 'base64').toString();
}

export function IsEmtpyString(value: string | undefined | null): boolean {
    if (value === null || value === undefined || value === '') return true;

    return false;
}
