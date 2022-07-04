const CID = require("cids");
const { NoOpLogger } = require("electron-updater");
const all = require("it-all");
const first = require("it-first");
const map = require("it-map");
const { join } = require("path/posix");
const { equals: uint8ArrayEquals } = require("uint8arrays/equals");
const { SpacePath } = require("../common/consts");
const logger = require("electron-log");

class itemProperty {
    getName(itemStat) {
        try {
            var name =
                itemStat.name ||
                itemStat.path.split("/").pop() ||
                itemStat.cid.toString();
            return name;
        } catch (err) {
            logger.error("met error during get file stat name:", itemStat);
        }
        return "";
    }

    constructor(itemStat, prefix = "/ipfs") {
        if (itemStat !== null) {
            if (itemStat.childItem === undefined) {
                (this.type =
                    itemStat.type === "dir" ? "directory" : itemStat.type),
                    (this.path =
                        itemStat.path ||
                        `${prefix}/${itemStat.cid.toString()}`),
                    (this.name = this.getName(itemStat)),
                    (this.cid = itemStat.cid),
                    (this.existed = itemStat.exist),
                    (this.pinned = Boolean(itemStat.pinned)),
                    (this.located =
                        itemStat.local === undefined
                            ? false
                            : itemStat.local && itemStat.withLocality),
                    (this.size = itemStat.cumulativeSize || itemStat.size || 0),
                    (this.locatedsize = itemStat.sizeLocal),
                    (this.locatedPercent =
                        itemStat.cumulativeSize === 0
                            ? 0
                            : (itemStat.sizeLocal * 100) /
                              itemStat.cumulativeSize);
                this.childItem = [];
            } else {
                Object.assign(this, itemStat);
            }
        }
    }

    async addChildItem(childItems) {
        for await (const item of childItems) {
            this.childItem.push(item);
        }
        return this;
    }
}

/**
 * @typedef {Object} FileStat
 * @property {number} size
 * @property {'directory'|'file'|'unknown'} type
 * @property {CID} cid
 * @property {string} name
 * @property {string} path
 * @property {boolean} pinned
 * @property {boolean|void} isParent
 *
 * @param {Object} stat
 * @param {'dir'|'directory'|'file'|'unknown'} stat.type
 * @param {CID} stat.cid
 * @param {string} stat.path
 * @param {number} [stat.cumulativeSize]
 * @param {number} stat.size
 * @param {string|void} [stat.name]
 * @param {boolean|void} [stat.pinned]
 * @param {boolean|void} [stat.isParent]
 * @param {string} [prefix]
 * @returns {FileStat}
 */
const fileFromStats = (
    {
        cumulativeSize,
        type,
        size,
        sizeLocal,
        exist,
        withLocality,
        local,
        cid,
        name,
        path,
        pinned,
    },
    prefix = "/ipfs"
) => ({
    type: type === "dir" ? "directory" : type,
    path: path || `${prefix}/${cid.toString()}`,
    name: name || path.split("/").pop() || cid.toString(),
    cid,
    existed: exist,
    pinned: Boolean(pinned),
    located: local === undefined ? false : local && withLocality,
    size: cumulativeSize || size || 0,
    locatedsize: sizeLocal,
    locatedPercent:
        cumulativeSize === 0 ? 0 : (sizeLocal * 100) / cumulativeSize,
});

/**
 *
 * @param {IPFSService} ipfs
 * @returns {AsyncIterable<Pin>}
 */
const getRawPins = async function* (ipfs) {
    yield* ipfs.pin.ls({ type: "recursive" });
    yield* ipfs.pin.ls({ type: "direct" });
};

/**
 * @param {IPFSService} ipfs
 * @returns {AsyncIterable<CID>}
 */
const getPinCIDs = (ipfs) => map(getRawPins(ipfs), (pin) => pin.cid);

/**
 * @typedef {Object} Stat
 * @property {string} path
 * @property {'file'|'directory'|'unknown'} type
 * @property {CID} cid
 * @property {number} cumulativeSize
 * @property {number} size
 *
 * @param {IPFSService} ipfs
 * @param {string|CID} cidOrPath
 * @returns {Promise<Stat>}
 */
async function getfileStats(ipfs, cidOrPath) {
    const hashOrPath = cidOrPath.toString();
    const path = hashOrPath.startsWith("/")
        ? hashOrPath
        : `/ipfs/${hashOrPath}`;

    try {
        let stats = await ipfs.files.stat(path, {
            withLocal: true,
            timeout: 30000,
        });
        return { exist: true, path, ...stats };
    } catch (e) {
        // Discard error and mark DAG as 'unknown' to unblock listing other pins.
        // Clicking on 'unknown' entry will open it in Inspector.
        // No information is lost: if there is an error related
        // to specified hashOrPath user will read it in Inspector.
        const [, , cid] = path.split("/");
        return {
            exist: false,
            path: hashOrPath,
            cid: CID.isCID(cid) ? new CID(cid) : undefined,
            type: "unknown",
            cumulativeSize: 0,
            size: 0,
            withLocality: false,
            local: false,
            sizeLocal: 0,
        };
    }
}

function cidIsEqual(first, second) {
    if (first === undefined || second === undefined) {
        return false;
    }

    if (first.version !== 1) {
        first = first.toV1();
    }
    if (second.version !== 1) {
        second = second.toV1();
    }

    return (
        first.code === second.code &&
        uint8ArrayEquals(first.bytes, second.bytes)
    );
}

async function* _internalGetItemProperty(ipfs, mfsPath, pinCIDs) {
    var files;
    if (Array.isArray(mfsPath) === false) {
        files = [mfsPath];
    } else {
        files = mfsPath;
    }

    yield* await all(
        files.map(async (filePath) => {
            const status = await getfileStats(ipfs, filePath);
            var isPin = false;
            for (const cid of pinCIDs) {
                var ret = cidIsEqual(cid.toV1(), status.cid);
                if (ret) {
                    isPin = true;
                    break;
                }
            }
            //return fileFromStats({ ...status, pinned: isPin })
            return new itemProperty({ ...status, pinned: isPin });
        })
    );
}

async function* _internalGetRecruiseItemProperty(
    ipfs,
    mfsPath,
    pinCIDs,
    recursive
) {
    const filesStat = await all(
        _internalGetItemProperty(ipfs, mfsPath, pinCIDs)
    );
    if (recursive) {
        yield* await all(
            filesStat.map(async (fileStatus) => {
                if (fileStatus.existed) {
                    if (fileStatus.type === "directory") {
                        var childItemsName = await all(
                            ipfs.files.ls(fileStatus.path, { timeout: 30000 })
                        );
                        if (childItemsName.length > 0) {
                            var childItemsFullName = await all(
                                childItemsName.map((childItemName) =>
                                    join(fileStatus.path, childItemName.name)
                                )
                            );
                            const childItemStat = await all(
                                _internalGetRecruiseItemProperty(
                                    ipfs,
                                    childItemsFullName,
                                    pinCIDs,
                                    recursive
                                )
                            );
                            //return {...fileStatus, childItem: childItemStat }
                            return fileStatus.addChildItem(childItemStat);
                        }
                    }
                }

                //return {...fileStatus}
                return fileStatus;
            })
        );
    } else {
        yield* filesStat;
    }
}

async function getItemProperty(ipfs, mfsPath, recursive = false) {
    const pinCIDs = await all(getPinCIDs(ipfs));

    if (Array.isArray(mfsPath)) {
        var itemsProperty = [];
        for (const itemPath of mfsPath) {
            itemsProperty.push(
                await first(
                    _internalGetRecruiseItemProperty(
                        ipfs,
                        itemPath,
                        pinCIDs,
                        recursive
                    )
                )
            );
        }
        return itemsProperty;
    } else {
        return await first(
            _internalGetRecruiseItemProperty(ipfs, mfsPath, pinCIDs, recursive)
        );
    }
}

async function getRootItemProperty(ipfs, recursive = false) {
    return await getItemProperty(ipfs, SpacePath.Root, recursive);
}

async function getBaseItemProperty(ipfs, recursive = false) {
    return await getItemProperty(ipfs, SpacePath.Base, recursive);
}

module.exports = Object.freeze({
    itemProperty,
    getItemProperty,
    getRootItemProperty,
    getBaseItemProperty,
});
