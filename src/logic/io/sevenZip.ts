import Seven from 'node-7z'
import sevenBin from '7zip-bin'

const binPath = sevenBin.path7za.replace('app.asar', 'app.asar.unpacked')

const compress = (source: string, target: string) => {
    return new Promise((resolve, reject) => {
        const stream = Seven.add(target, source, {$bin: binPath})
        stream.on('end', resolve)
        stream.on('error', reject)
    })
};

const extract = (source: string, target: string) => {
    return new Promise((resolve, reject) => {
        const stream = Seven.extractFull(source, target, {$bin: binPath})
        stream.on('end', resolve)
        stream.on('error', reject)
    })
};

export default {
    compress,
    extract
}
