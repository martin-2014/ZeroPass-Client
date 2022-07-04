"use strict";
const logger = require("electron-log");
const { getItemProperty } = require("./itemProperty");

async function pinToLocal(ipfs, mfsPath, onProgress) {
    const itemProperty = await getItemProperty(ipfs, mfsPath);
    if (!itemProperty.existed) {
        return false;
    }

    const interval = await emitProgress(ipfs, mfsPath, onProgress);
    if (!itemProperty.pinned) {
        ipfs.pin.add(itemProperty.cid).catch((err) => {
            logger.error(`pin ${itemProperty.cid} met issue: ${err}`);
            if (interval !== undefined) {
                clearInterval(interval);
            }
        });
    }

    return true;
}

function stopInterval(interval, itemProperty, onProgress) {
    //itemProperty.locatedPercent, itemProperty.pinned, itemProperty.locatedsize, itemProperty.size
    if (onProgress !== undefined) {
        onProgress(itemProperty, true);
    }
    clearInterval(interval);
}

async function updateProgress(ipfs, mfsPath, onProgress) {
    const itemProperty = await getItemProperty(ipfs, mfsPath);
    if (onProgress !== undefined) {
        onProgress(itemProperty, false);
    }
    return itemProperty;
}

function isLocalPinned(itemProperty) {
    if (itemProperty === undefined) return false;

    return itemProperty.pinned && itemProperty.locatedPercent === 100;
}

async function emitProgress(ipfs, mfsPath, onProgress) {
    if (onProgress === undefined) {
        return;
    }

    var pausedTimes = 0;
    var lastDownloadSize = 0;

    const itemProperty = await updateProgress(ipfs, mfsPath, onProgress);
    if (isLocalPinned(itemProperty)) {
        onProgress(itemProperty, true);
    } else {
        const interval = setInterval(async () => {
            const itemProperty = await updateProgress(
                ipfs,
                mfsPath,
                onProgress
            );

            if (isLocalPinned(itemProperty)) {
                stopInterval(interval, itemProperty, onProgress);
            }

            if (itemProperty.locatedsize > lastDownloadSize) {
                lastDownloadSize = itemProperty.locatedsize;
                pausedTimes = 0;
            }

            pausedTimes = pausedTimes + 1;
            if (pausedTimes === 150) {
                stopInterval(interval, itemProperty, onProgress);
            }
        }, 2000);
    }
}

module.exports = Object.freeze({
    isLocalPinned,
    pinToLocal,
});
