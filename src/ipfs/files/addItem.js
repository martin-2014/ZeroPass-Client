"use strict";
const fs = require("fs-extra");
const { globSource } = require("ipfs-http-client");
const { basename } = require("path");
const { join } = require("path/posix");
const last = require("it-last");
const { removeItem } = require("./removeItem");
const { getItemProperty } = require("./itemProperty");
const { pinToLocal } = require("./localPin");
const logger = require("electron-log");

async function copyItemToMfs(ipfs, cid, itemProperty, overwrite = false) {
    if (itemProperty.existed) {
        if (overwrite) {
            var removed = await removeItem(ipfs, itemProperty);
            if (!removed) {
                logger.error(
                    `overwrite the old exist mfs file ${itemProperty.path} failed`
                );
                return false;
            }
        } else {
            logger.error(
                `the target mfs file ${itemProperty.path} already exist`
            );
            return false;
        }
    }

    for (let index = 0; index < 5; index++) {
        try {
            logger.verbose(
                `try to copy /ipfs/${cid.toString()} to ${itemProperty.path}`
            );
            await ipfs.files.cp(`/ipfs/${cid.toString()}`, itemProperty.path, {
                parents: true,
                timeout: 60000,
            });
            return true;
        } catch (err) {
            if (index === 4) {
                logger.error(
                    `met error during copy /ipfs/${cid.toString()} to mfs ${
                        itemProperty.path
                    }, the detail`,
                    err.message
                );
            }
        }
    }

    return false;
}

async function createDirectoryInMfs(ipfs, path) {
    for (let index = 0; index < 3; index++) {
        try {
            await ipfs.files.mkdir(path, { parents: true, timeout: 3000 });
            return true;
        } catch (err) {
            logger.error(
                `met error during make a directory ${path} in your mfs, the detail:`,
                err.message
            );
        }
    }

    return false;
}

async function addItemToIpfs(ipfs, localItem, isDirectory) {
    let res = undefined;
    if (isDirectory) {
        const childfiles = globSource(localItem, "**/*", { recursive: true });
        res = await last(
            ipfs.addAll(childfiles, { pin: false, wrapWithDirectory: true })
        );
    } else {
        const readStream = fs.createReadStream(localItem);

        res = await ipfs.add(readStream, { pin: false });
    }

    return res.cid;
}

async function addItemFromLocal(ipfs, localItem, targetFolder) {
    return new Promise(async (resolve, reject) => {
        try {
            const localStats = fs.statSync(localItem);
            if (localStats == undefined) {
                throw new Error(`the ${localItem} does not exists`);
            }

            const targetMfsPath = join(targetFolder, basename(localItem));
            const targetItemProperty = await getItemProperty(
                ipfs,
                targetMfsPath
            );
            if (targetItemProperty.existed) {
                if (localStats.isDirectory()) {
                    throw new Error(
                        `the target folder ${targetItemProperty.path} already exist`
                    );
                }
            }

            let cid = await addItemToIpfs(
                ipfs,
                localItem,
                localStats.isDirectory()
            );
            if (cid === undefined) {
                throw new Error(`add file ${localItem} to ipfs failed`);
            }

            var ret = await copyItemToMfs(ipfs, cid, targetItemProperty, true);
            if (!ret) {
                throw new Error(
                    `copy ${cid} into mfs ${targetItemProperty.path} failed`
                );
            }

            const itemResult = { cid, path: targetMfsPath };
            resolve(itemResult);
            return itemResult;
        } catch (err) {
            reject(err);
            return undefined;
        }
    });
}

async function addItemFromIpfs(
    ipfs,
    cid,
    targetItem,
    downloadData = false,
    onProgress = undefined
) {
    return new Promise(async (resolve, reject) => {
        try {
            const targetItemProperty = await getItemProperty(ipfs, targetItem);
            if (targetItemProperty.existed) {
                logger.debug(`the target item ${targetItem} will be overwrite`);
            }

            const ret = await copyItemToMfs(
                ipfs,
                cid,
                targetItemProperty,
                true
            );
            if (!ret) {
                throw new Error(`copy ${cid} into mfs ${targetItem} failed`);
            }

            if (downloadData === true) {
                const pinRet = await pinToLocal(ipfs, targetItem, onProgress);
                if (!pinRet) {
                    throw new Error(`the ${targetItem} item does not exists`);
                }
            }

            resolve({ cid, path: targetItem });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = Object.freeze({
    addItemFromLocal,
    addItemFromIpfs,
    createDirectoryInMfs,
});
