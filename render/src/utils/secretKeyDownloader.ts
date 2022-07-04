export const utf8BOM = '\ufeff';

export const downloadSecretKey = (email: string, secretKey: string) => {
    let name = email;
    if (email.includes('@')) {
        var nameMatch = email.match(/^([^@]*)@/);
        name = nameMatch ? nameMatch[1] : 'unknown';
    }
    const fileName = `zeropass-secret-key-${name}.key`;
    downloadFile(fileName, secretKey);
};

export const downloadFile = (filename: string, content: any) => {
    const aTag = document.createElement('a');
    const blob = new Blob([content]);
    aTag.download = filename;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
};
