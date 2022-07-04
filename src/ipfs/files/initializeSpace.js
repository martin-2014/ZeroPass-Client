const logger = require("electron-log");
const { addItemFromIpfs, createDirectoryInMfs } = require("./addItem");
const { removeItemByPath } = require("./removeItem");
const { getItemProperty } = require("./itemProperty");
const { isLocalPinned } = require("./localPin");
const { SpacePath } = require("../common/consts");

async function _internalcloneRemoteSpace(
    ipfs,
    rootCid,
    deepClone = false,
    onProgress = undefined,
    resolve,
    reject
) {
    const clear = await removeItemByPath(ipfs, "/");
    if (!clear) {
        reject(new Error("clear the local space failed"));
        return;
    }

    if (rootCid === "") {
        var rootRet = createDirectoryInMfs(ipfs, SpacePath.Root);
        var baseRet = createDirectoryInMfs(ipfs, SpacePath.Base);
        if (rootRet === false || baseRet === false) {
            await removeItemByPath(ipfs, "/");
            reject(new Error("create the local space failed"));
            return;
        } else {
            const rootFolder = await getItemProperty(
                ipfs,
                SpacePath.Root,
                true
            );
            resolve(rootFolder);
        }
    } else {
        const rootFolder = await addItemFromIpfs(
            ipfs,
            rootCid,
            SpacePath.Root,
            deepClone,
            async (itemProperty, final) => {
                if (deepClone) {
                    if (!final) {
                        if (onProgress !== undefined) {
                            onProgress(itemProperty);
                        }
                        return;
                    }
                    if (isLocalPinned(itemProperty)) {
                        const rootFolder = await getItemProperty(
                            ipfs,
                            SpacePath.Root,
                            true
                        );
                        resolve(rootFolder);
                    } else {
                        reject(
                            new Error(
                                `clone ${mfsPath} to local space failed. the reason: task timeout`
                            )
                        );
                        return;
                    }
                }
            }
        ).catch(async (err) => {
            logger.error("met error when add item in clonse space", err);
            await removeItemByPath(ipfs, "/");
            reject(err);
            return undefined;
        });

        if (rootFolder === undefined) {
            return undefined;
        }

        const baseFolder = await addItemFromIpfs(
            ipfs,
            rootCid,
            SpacePath.Base,
            false
        ).catch(async (err) => {
            await removeItemByPath(ipfs, "/");
            reject(err);
            return undefined;
        });

        if (rootFolder === undefined || baseFolder === undefined) {
            await removeItemByPath(ipfs, "/");
            reject(new Error("clone item to local space failed"));
            return undefined;
        }

        if (!deepClone) {
            const rootFolder = await getItemProperty(
                ipfs,
                SpacePath.Root,
                true
            );
            resolve(rootFolder);
        }
    }
}

async function cloneRemoteSpace(
    ipfs,
    rootCid,
    deepClone = false,
    onProgress = undefined
) {
    return new Promise((resolve, reject) => {
        _internalcloneRemoteSpace(
            ipfs,
            rootCid,
            deepClone,
            onProgress,
            resolve,
            reject
        );
    });
}

module.exports = Object.freeze({
    cloneRemoteSpace,
});
