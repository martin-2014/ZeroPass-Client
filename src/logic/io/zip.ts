import fs from "fs";
import archiver from "archiver";
import extract from "extract-zip";

const zip = (source: string, target: string) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fs.createWriteStream(target);
    return new Promise<void>((resolve, reject) => {
        archive.directory(source, false).on("error", reject).pipe(stream);
        stream.on("close", resolve);
        archive.finalize();
    });
};

const unzip = async (source: string, target: string) => {
    await extract(source, { dir: target });
};

export { zip, unzip };
