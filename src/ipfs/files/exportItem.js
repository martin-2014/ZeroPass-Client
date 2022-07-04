const logger = require("electron-log");
const toUri = require("multiaddr-to-uri");
var request = require("request");
const fs = require("fs-extra");
const tar = require("tar");
const { basename } = require("path");
const { join } = require("path/posix");
const { pinToLocal, isLocalPinned } = require("./localPin");
const { makeDirectory } = require("../utility");

/**
 * @typedef {Object} FileDownload
 * @property {string} url
 * @property {string} filename
 * @property {string} method
 *
 * @param {FileStat} fileStat
 * @param {string} gatewayUrl
 * @param {string} apiUrl
 * @returns {Promise<FileDownload>}
 */
function getSingleFileDownloadLink(apiUrl, gatewayUrl, fileStat) {
    let url, method;

    if (fileStat.type === "directory") {
        url = `${apiUrl}/api/v0/get?arg=${fileStat.cid}&archive=true&compress=true`;
        method = "POST"; // API is POST-only
    } else {
        url = `${gatewayUrl}/ipfs/${fileStat.cid}`;
        method = "GET";
    }

    return {
        url,
        filename: fileStat.name,
        method,
        type: fileStat.type,
        fileStat: [fileStat],
    };
}

/**
 * @param {FileStat[]} files
 * @param {IPFSService} ipfs
 * @returns {Promise<CID>}
 */
async function makeCIDFromFiles(ipfs, files) {
    // Note: we don't use 'object patch' here, it was deprecated.
    // We are using MFS for creating CID of an ephemeral directory
    // because it handles HAMT-sharding of big directories automatically
    // See: https://github.com/ipfs/go-ipfs/issues/8106
    const dirpath = `/ipfs_temp_${Date.now()}`;
    await ipfs.files.mkdir(dirpath, { timeout: 30000 });

    try {
        for (const { cid, name } of files) {
            await ipfs.files.cp(`/ipfs/${cid}`, `${dirpath}/${name}`, {
                timeout: 30000,
            });
        }

        const stat = await ipfs.files.stat(dirpath, { timeout: 30000 });
        return stat.cid;
    } catch (err) {
        throw new Error(
            "met error during create temp folder for multi files, the detail:",
            err
        );
    } finally {
        // Do not wait for this
        ipfs.files.rm(dirpath, { recursive: true, timeout: 30000 });
    }
}

/**
 *
 * @param {FileStat[]} fileStat
 * @param {string} apiUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<FileDownload>}
 */
async function getMultipleFileDownloadLink(ipfs, apiUrl, fileStat) {
    if (!apiUrl) {
        throw new Error("api url undefined");
    }

    const cid = await makeCIDFromFiles(ipfs, fileStat);
    if (cid === undefined) {
        throw new Error("package multi file into one folder failed");
    }

    return {
        url: `${apiUrl}/api/v0/get?arg=${cid}&archive=true&compress=true`,
        filename: "",
        method: "POST", // API is POST-only
        type: "MultiFile",
        fileStat: fileStat,
    };
}

function getURLFromAddress(config, name) {
    if (!config) return undefined;

    try {
        const address = Array.isArray(config.Addresses[name])
            ? config.Addresses[name][0]
            : config.Addresses[name];
        const url = toUri(address, { assumeHttp: true });
        if (new URL(url).port === 0) {
            logger.error("port set to 0, not deterministic");
            return undefined;
        }
        return url;
    } catch (error) {
        logger.error(
            `Failed to get url from config at Addresses.${name}`,
            error
        );
        return undefined;
    }
}

async function getConfig(ipfs) {
    const rawConf = await ipfs.config.getAll();
    let conf;

    if (Buffer.isBuffer(rawConf)) {
        conf = rawConf.toString();
    } else {
        conf = JSON.stringify(rawConf, null, "\t");
    }

    return JSON.parse(conf);
}

async function getDownloadLink(ipfs, mfsPath) {
    var files;
    if (Array.isArray(mfsPath) === false) {
        files = [mfsPath];
    } else {
        files = mfsPath;
    }

    const filsStat = await Promise.all(
        files.map(async (file) => {
            const stat = await ipfs.files.stat(file, { timeout: 30000 });
            const filename = basename(file);
            return {
                cid: stat.cid.toString(),
                path: file,
                name: filename,
                type: stat.type,
                sizeofIpfs: stat.cumulativeSize,
                sizeofFile: stat.size,
            };
        })
    );

    const config = await getConfig(ipfs);
    const apiUrl = getURLFromAddress(config, "API");
    const gatewayUrl = getURLFromAddress(config, "Gateway");
    if (apiUrl === undefined || gatewayUrl === undefined) {
        throw new Error(`get api or gateway path failed`);
    }

    if (files.length === 1) {
        return getSingleFileDownloadLink(apiUrl, gatewayUrl, filsStat[0]);
    }

    return await getMultipleFileDownloadLink(ipfs, apiUrl, filsStat);
}

function showProgress(received, total) {
    var percentage = (received * 100) / total;
    //logger.debug(percentage + "% | " + received + " bytes out of " + total + " bytes.");
}

async function downloadItemToLocal(
    downloadLink,
    targetDir,
    resolve,
    reject,
    retry
) {
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;
    const destName = join(targetDir, downloadLink.filename);

    var outStream;
    if (downloadLink.type === "file") {
        outStream = fs.createWriteStream(destName);
    } else {
        const isDestExist = await makeDirectory(destName).catch((err) => {
            reject(
                new Error(
                    `create ${destName} folder failed, the detail: ${err}`
                )
            );
            return false;
        });
        if (isDestExist === false) {
            reject(new Error(`create ${destName} folder failed`));
            return false;
        }

        outStream = tar.extract({
            strip: 1,
            unlink: true,
            cwd: destName,
        });
    }

    var req = request({
        method: downloadLink.method,
        uri: downloadLink.url,
        timeout: 30000,
    });

    req.pipe(outStream)
        .on("error", function (err) {
            if (downloadLink.type === "file") {
                fs.unlink(destName); // Delete the file async. (But we don't check the result)
            }
            reject(
                new Error(
                    `the http request write stream into ${destName} failed, the detail: ${err}`
                )
            );
            return;
        })
        .on("finish", function () {
            //logger.debug(`the http request write stream into ${destName} finish`);
            const destfileStat = downloadLink.fileStat.map((file) => {
                const destName = join(targetDir, file.name);
                return {
                    ipfsPath: file.path,
                    localPath: destName,
                    type: file.type,
                    cid: file.cid,
                    sizeofFile: file.sizeofFile,
                    sizeofIpfs: file.sizeofIpfs,
                };
            });
            resolve(destfileStat);
            return;
        })
        .on("close", () => {
            //logger.debug(`the http writestream whcih related to ${destName} closed`);
        });

    req.on("response", function (data) {
        if (data.statusCode !== 200) {
            reject(
                new Error(
                    `the http request failed during download ${destName}, the response code: ${res.statusCode}`
                )
            );
            return;
        }
        // Change the total bytes value to get progress later.
        var total1 = parseInt(data.headers["x-content-length"]);
        var total2 = parseInt(data.headers["content-length"]);

        total_bytes = total1 || total2;
    });

    req.on("data", function (chunk) {
        // Update the received bytes
        received_bytes += chunk.length;
        showProgress(received_bytes, total_bytes);
    });

    req.on("error", function (err) {
        if (err.code == "ESOCKETTIMEDOUT") {
            retry(resolve, reject, err);
            return;
        } else {
            let errorDetail;
            if (err.code === "ENOTFOUND") {
                errorDetail = "network connectivity issue" + err.message;
            } else {
                errorDetail = err.message;
            }
            reject(
                new Error(
                    `the http request failed during download ${destName}, the error detail: ${errorDetail}`
                )
            );
            return;
        }
    });

    req.on("end", function () {
        //logger.debug(`the http request end when download ${destName}`);
    });

    req.on("close", function () {
        //logger.debug(`the http request closed when download ${destName}`);
    });

    //logger.debug("finished to download file function: ", destName);
}

async function exportToLocal(ipfs, mfsPath, targetDir, resolve, reject) {
    try {
        if (targetDir === undefined || targetDir === "") {
            throw new Error("the target item is empty");
        }

        // if (!fs.existsSync(targetDir)) {
        //     await mkdirp(targetDir).catch((err) => {
        //         throw err;
        //     });
        // }
        await makeDirectory(targetDir).catch((err) => {
            throw err;
        });

        const downloadLink = await getDownloadLink(ipfs, mfsPath);
        if (downloadLink === undefined) {
            throw new Error(
                `get ${mfsPath} links failed because ipfs config invalidate`
            );
        }

        var retryTimes = 0;
        async function retry(resolve, reject, err) {
            retryTimes = retryTimes + 1;
            if (retryTimes > 3) {
                logger.error(
                    `the http request failed after ${retryTimes} times` +
                        new Date().toISOString()
                );
                throw err;
            }

            logger.warn(
                `the http request timeout, retry the ${retryTimes} times` +
                    new Date().toISOString()
            );
            downloadItemToLocal(
                downloadLink,
                targetDir,
                resolve,
                reject,
                retry
            );
        }

        downloadItemToLocal(downloadLink, targetDir, resolve, reject, retry);
    } catch (err) {
        reject(err);
        return;
    }
}

module.exports = async function (ipfs, mfsPath, targetDir, onProgress) {
    return new Promise(async (resolve, reject) => {
        const ret = await pinToLocal(
            ipfs,
            mfsPath,
            async (itemProperty, final) => {
                if (!final) {
                    if (onProgress !== undefined) {
                        onProgress(itemProperty);
                    }
                    return;
                }

                if (isLocalPinned(itemProperty)) {
                    await exportToLocal(
                        ipfs,
                        mfsPath,
                        targetDir,
                        resolve,
                        reject
                    ).catch((err) => {
                        reject(err);
                        return false;
                    });
                } else {
                    reject(
                        new Error(
                            `clone ${mfsPath} to local repository failed. the reason: task timeout`
                        )
                    );
                    return false;
                }
            }
        );

        if (!ret) {
            reject(new Error(`the ${mfsPath} item does not exists`));
        }
    });
};
