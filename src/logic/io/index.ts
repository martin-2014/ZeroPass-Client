import hash from "./hash";
import sevenZip from "./sevenZip";
import fsPromise from "fs/promises";
import fs from "fs";
import path from "path";

const exists = async (path: string) => {
    try {
        await fsPromise.access(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

const isDir = async (path: string) => {
    const stat = await fsPromise.lstat(path);
    return stat.isDirectory();
};

const copy = async (source: string, target: string) => {
    if (!(await exists(source))) return;
    const recursiveCopy = async (source: string, target: string) => {
        if (!(await isDir(source))) {
            await fsPromise.copyFile(source, target);
        } else {
            if (!(await exists(target))) {
                await fsPromise.mkdir(target, { recursive: true });
            }
            const files = await fsPromise.readdir(source);
            for (let f of files) {
                const sourceFile = path.join(source, f);
                const targetFile = path.join(target, f);
                if (await isDir(sourceFile)) {
                    await recursiveCopy(sourceFile, targetFile);
                } else {
                    await fsPromise.copyFile(sourceFile, targetFile);
                }
            }
        }
    };
    await recursiveCopy(source, target);
};

const getParentFolder = (path1: string) => {
    return path.resolve(path.dirname(path1), "..");
};

const cleanDir = async (dir: string) => {
    if (!(await exists(dir)) || !(await isDir(dir))) {
        return;
    }
    const files = await fsPromise.readdir(dir);
    for (let f of files) {
        const filePath = path.join(dir, f);
        if (!(await isDir(filePath))) {
            await fsPromise.rm(filePath);
        } else {
            await fsPromise.rm(filePath, { recursive: true, force: true });
        }
    }
};

const createDirs = async (path: string) => {
    if ((await exists(path)) && (await isDir(path))) return;
    await fsPromise.mkdir(path, { recursive: true });
};

export {
    getParentFolder,
    exists,
    isDir,
    copy,
    hash,
    cleanDir,
    sevenZip,
    createDirs,
};
