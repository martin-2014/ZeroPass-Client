import crypto from "crypto";
import fs from "fs";
import fsPromise from "fs/promises";
import { exists } from ".";

const calHash = async (path: string, alg: string): Promise<string> => {
    if (!exists(path)) {
        return;
    }
    const buf = await fsPromise.readFile(path);
    const hash = crypto.createHash(alg);
    hash.update(buf);
    const hex = hash.digest("hex");
    return hex;
};

const sha2 = async (path: string): Promise<string> => {
    return await calHash(path, "sha256");
};

const sha1 = async (path: string): Promise<string> => {
    return await calHash(path, "sha1");
};

export default { sha1, sha2 };
