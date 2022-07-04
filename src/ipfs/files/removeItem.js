const { getItemProperty } = require("./itemProperty");
const logger = require("electron-log");

async function removeItem(ipfs, fileStatus) {
    var files;
    if (Array.isArray(fileStatus) === false) {
        files = [fileStatus];
    } else {
        files = fileStatus;
    }

    const tryAsync = async (fn) => {
        try {
            await fn();
        } catch (_) {}
    };

    try {
        // try removing from MFS first
        var removed = await Promise.all(
            files.map(async (file) => {
                {
                    if (!file.existed) {
                        return false;
                    }
                    await ipfs.files.rm(file.path, {
                        recursive: true,
                        timeout: 30000,
                    });
                    return true;
                }
            })
        );

        // removal of local pin can fail if same CID is present twice,
        // this is done in best-effort as well
        await Promise.all(
            files.map(
                async (file) =>
                    file.pinned && tryAsync(() => ipfs.pin.rm(file.cid))
            )
        );

        return removed.every((element) => element === true);
    } catch (err) {
        logger.error("remove file failed:", err);
    }

    return false;
}

async function removeItemByPath(ipfs, mfsPath) {
    var rootChildItem;
    if (mfsPath === "/") {
        var rootFolder = await getItemProperty(ipfs, mfsPath, true);
        rootChildItem = rootFolder.childItem;
        if (rootChildItem === undefined) {
            return true;
        }
    } else {
        rootChildItem = await getItemProperty(ipfs, mfsPath);
    }

    return await removeItem(ipfs, rootChildItem);
}

module.exports = Object.freeze({
    removeItem,
    removeItemByPath,
});
