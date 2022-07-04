const CID = require("cids");
const { equals: uint8ArrayEquals } = require("uint8arrays/equals");
const fs = require("fs-extra");
var mkdirp = require("mkdirp");

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

function toCID(cidText) {
    return new CID(cidText);
}

async function makeDirectory(targetDir) {
    return new Promise(async (resolve, reject) => {
        if (targetDir === undefined || targetDir === "") {
            reject(new Error("the target item is empty"));
            return false;
        }

        if (!fs.existsSync(targetDir)) {
            await mkdirp(targetDir)
                .then(() => {
                    resolve(true);
                    return true;
                })
                .catch((err) => {
                    reject(err);
                    return false;
                });
        }
        resolve(true);
        return true;
    });
}

module.exports = Object.freeze({
    toCID,
    cidIsEqual,
    makeDirectory,
});
