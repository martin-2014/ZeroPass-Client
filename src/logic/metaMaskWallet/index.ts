import path from "path";
import fsPromise from "fs/promises";
import fs from "fs";
import { exists, copy, sevenZip } from "../io";
import logger from "electron-log";
import { Level } from "level";

const MetaMaskGoogleExtensionId = "nkbihfbeogaeaoehlefnkodbefgpgknn";
const MetaMaskEdgeAddonId = "ejbalbakoplchlghecdalmeeeajnimhm";
const MetaMaskBackupContainerName = "mmbk";

const getAppDataPath = () => path.join(process.env.localappdata, "zeropass");
const getAppTempPath = (userId: number) => {
    return path.join(
        getAppDataPath(),
        "temp",
        userId.toString(),
        MetaMaskBackupContainerName
    );
};

const getBackupContainer = (userId: number) => {
    return path.join(
        getAppDataPath(),
        "data",
        userId.toString(),
        MetaMaskBackupContainerName
    );
};

type BrowserInfoType = {
    appDataPath?: string;
    supportedExtensions?: MetaMask.ExtensionType[];
};

const getBrowerAppDataPath = (company: string, appName: string) => {
    return path.join(process.env.localappdata, company, appName, "User Data");
};

const BrowserInfo = new Map<MetaMask.BrowserType, BrowserInfoType>([
    [
        "Chrome",
        {
            appDataPath: getBrowerAppDataPath("Google", "Chrome"),
            supportedExtensions: ["Chrome"],
        },
    ],
    [
        "Edge",
        {
            appDataPath: getBrowerAppDataPath("Microsoft", "Edge"),
            supportedExtensions: ["Chrome", "Edge"],
        },
    ],
    [
        "Brave",
        {
            appDataPath: getBrowerAppDataPath("BraveSoftware", "Brave-Browser"),
            supportedExtensions: ["Chrome"],
        },
    ],
]);

const BrowserExtensions = new Map<MetaMask.ExtensionType, string>([
    ["Chrome", MetaMaskGoogleExtensionId],
    ["Edge", MetaMaskEdgeAddonId],
]);

const detectProfiles = async (args: MetaMask.BrowserProfileDetectArgs) => {
    try {
        let profiles = [];
        for (let [browser, _] of BrowserInfo) {
            const result = await detectBrowserProfiles(browser, args);
            profiles = [...profiles, ...result];
        }
        return profiles;
    } catch (err) {
        logger.error("detect profiles error: " + err);
        return [];
    }
};

const createBackup = async (args: MetaMask.CreateBackupArgs) => {
    const { profile, backupName, userId } = args;
    try {
        const temp = await copyToTemp(profile, backupName);
        return await zipToBackup(userId, temp, backupName);
    } catch (err) {
        logger.error(`failed to create backup ${backupName}` + err);
        return false;
    }
};

const deleteBackup = async (args: MetaMask.DeleteBackupArgs) => {
    const { userId, backupName } = args;
    const target = path.join(getBackupContainer(userId), backupName);
    try {
        await fsPromise.rm(target);
    } catch (err) {
        logger.error(`failed to delete backup ${target}` + err);
    }
    const tempTarget = path.join(
        getAppTempPath(userId),
        backupName.split(".")[0]
    );
    try {
        await fsPromise.rm(tempTarget, { recursive: true });
    } catch (err) {
        logger.error(`failed to delete temp ${tempTarget}` + err);
    }
};

const existsBackup = async (args: MetaMask.ExistsBackupArgs) => {
    const { userId, backupName } = args;
    const backupContainer = getBackupContainer(userId);
    return await exists(path.join(backupContainer, backupName));
};

const getWalletState = async (
    profile: MetaMask.BrowserProfile
): Promise<MetaMask.WalletState> => {
    const extensionDir = getExtensionDir(profile);
    if (!(await exists(extensionDir))) return "nonexistent";
    if (!(await isOccupied(extensionDir))) return "unwritable";
    return "writable";
};

const recoverBackup = async (args: MetaMask.RecoverBackupArgs) => {
    try {
        await recover(args);
        return true;
    } catch (err) {
        logger.error(`failed to recover backup ${args.backupName}` + err);
        return false;
    }
};

const isOccupied = async (path: string) => {
    try {
        const newName = `${path}.test`;
        await fsPromise.rename(path, newName);
        await fsPromise.rename(newName, path);
        return true;
    } catch {
        return false;
    }
};

const recover = async (args: MetaMask.RecoverBackupArgs) => {
    const { userId, backupName, profile } = args;
    const source = path.join(getBackupContainer(userId), backupName);
    const extensionContainer = getExtensionDir(profile);
    let newName = "";
    if (await exists(extensionContainer)) {
        newName = `${extensionContainer}.old`;
        await fsPromise.rename(extensionContainer, newName);
    }
    try {
        const tempRecover = path.join(
            process.env.temp,
            backupName.split(".")[0]
        );
        if (await exists(tempRecover)) {
            await fsPromise.rm(tempRecover, { recursive: true });
        }
        await sevenZip.extract(source, process.env.temp);
        await copy(tempRecover, extensionContainer);
        await fsPromise.rm(tempRecover, { recursive: true });
    } catch (err) {
        if (newName) {
            await fsPromise.rename(newName, extensionContainer);
        }
        throw err;
    }
    if (newName) {
        await fsPromise.rm(newName, { recursive: true });
    }
};

const detectBrowserProfiles = async (
    browser: MetaMask.BrowserType,
    args: MetaMask.BrowserProfileDetectArgs
): Promise<MetaMask.BrowserProfile[]> => {
    const { mode } = args;
    const browserInfo = BrowserInfo.get(browser);
    const localStateFile = path.join(browserInfo.appDataPath, "Local State");

    if (!(await exists(localStateFile))) return [];
    const localStateData = await fsPromise.readFile(localStateFile);
    const localState = JSON.parse(localStateData.toString());
    const profileInfo = Object.keys(localState.profile.info_cache);
    let profiles: MetaMask.BrowserProfile[] = [];
    profileInfo.forEach((p) => {
        browserInfo.supportedExtensions.forEach((extension) => {
            profiles.push({
                browser: browser,
                name: p,
                displayName: localState.profile.info_cache[p]["name"],
                extension: extension,
            });
        });
    });
    if (mode === "backup") {
        profiles = profiles.filter((p) => fs.existsSync(getExtensionDir(p)));
    } else if (mode === "recover") {
        profiles = filterRecoverEdgeProfile(profiles);
    }
    return profiles;
};

const filterRecoverEdgeProfile = (profiles: MetaMask.BrowserProfile[]) => {
    const edgeProfiles = profiles.filter((p) => p.browser === "Edge");
    const edgeProfilesWithExtension = edgeProfiles.filter((p) =>
        fs.existsSync(getExtensionDir(p))
    );
    const edgeExtensionCount = getExtensionStats(edgeProfilesWithExtension);
    const filteredProfiles = [];
    profiles.forEach((p) => {
        if (p.browser !== "Edge") filteredProfiles.push(p);
        else {
            const count = edgeExtensionCount[p.name] ?? 0;
            if (count === 0 && p.extension === "Edge") {
                filteredProfiles.push(p);
            } else if (count === 1) {
                filteredProfiles.push(
                    edgeProfilesWithExtension.find(
                        (item) => item.name === p.name
                    )
                );
                edgeExtensionCount[p.name] = -1;
            } else if (count === 2) {
                filteredProfiles.push(p);
            }
        }
    });
    return filteredProfiles;
};

const getExtensionStats = (profiles: MetaMask.BrowserProfile[]) => {
    const stats = {};
    profiles.forEach((p) => {
        stats[p.name] = (stats[p.name] ?? 0) + 1;
    });
    return stats;
};

const copyToTemp = async (
    profile: MetaMask.BrowserProfile,
    backupName: string
) => {
    const source = getExtensionDir(profile);
    const tempBackup = path.join(process.env.temp, backupName.split(".")[0]);
    if (await exists(tempBackup)) {
        await fsPromise.rm(tempBackup, { recursive: true });
    }
    await copy(source, tempBackup);
    return tempBackup;
};

const zipToBackup = async (
    userId: number,
    tempBackup: string,
    backupName: string
) => {
    const backupDir = getBackupContainer(userId);
    if (!(await exists(backupDir))) {
        await fsPromise.mkdir(backupDir);
    }
    const zipOutput = path.join(backupDir, backupName);
    await sevenZip.compress(tempBackup, zipOutput);
    await fsPromise.rm(tempBackup, { recursive: true });
    return await exists(zipOutput);
};

const getExtensionDir = (profile: MetaMask.BrowserProfile) => {
    const browserInfo = BrowserInfo.get(profile.browser);
    return path.join(
        browserInfo.appDataPath,
        profile.name,
        "Local Extension Settings",
        BrowserExtensions.get(profile.extension)
    );
};

const extractBackupIfNotExists = async (userId: number, backupName: string) => {
    const filePath = path.join(getBackupContainer(userId), backupName);
    const tempPath = getAppTempPath(userId);
    const extractedPath = path.join(tempPath, backupName.split(".")[0]);
    if (!(await exists(filePath))) return extractedPath;
    if (!(await exists(extractedPath))) {
        await sevenZip.extract(filePath, tempPath);
    }
    return extractedPath;
};

const getWalletsAccountFromDb = async (
    args: MetaMask.GetWalletAccountsFromDbArgs
): Promise<MetaMask.WalletAccount[]> => {
    const { userId, backupName, networkChain } = args;
    const extractedPath = await extractBackupIfNotExists(userId, backupName);
    const db = new Level(extractedPath, { valueEncoding: "json" });
    try {
        return await getAccountsFromDb(db, networkChain);
    } catch (err) {
        logger.error("get account err: " + err);
    } finally {
        await db.close();
    }
    return [];
};

const getAccountsFromDb = async (
    db: Level,
    chains: MetaMask.NetworkChain[]
) => {
    const data = (await db.get("data")) as Object;
    const identities = data["PreferencesController"]["identities"];
    const allTokens = data["TokensController"]["allTokens"];
    const accounts = Object.keys(identities).map((address) => {
        const tokens = chains.map((chain) => {
            let addresses = [];
            if (allTokens[chain.id] && allTokens[chain.id][address]) {
                addresses = allTokens[chain.id][address].map(
                    (token) => token.address
                );
            }
            return {
                network: chain.network,
                addresses,
            };
        });
        return {
            name: identities[address]["name"] as string,
            address,
            tokens,
        };
    });
    return accounts;
};

const extractAccount = async (args: MetaMask.ExtractWalletArgs) => {
    const { userId, backupName, properties = [] } = args;
    const extractedPath = await extractBackupIfNotExists(userId, backupName);
    const db = new Level(extractedPath, { valueEncoding: "json" });
    try {
        const data = (await db.get("data")) as Object;
        if (properties.length === 0) return data;
        return properties.reduce((pre, cur) => {
            pre[cur] = getPropertyValue(data, cur);
            return pre;
        }, {});
    } catch (err) {
        logger.error("extract account err: " + err);
    } finally {
        await db.close();
    }
};

const getPropertyValue = (obj: any, pro: string) => {
    const parts = pro.split(".");
    return parts.reduce((preValue, curPro) => {
        if (!preValue?.hasOwnProperty(curPro)) {
            return undefined;
        }
        return preValue[curPro];
    }, obj);
};

export default {
    createBackup,
    deleteBackup,
    recoverBackup,
    existsBackup,
    getWalletState,
    detectProfiles,
    getWalletsAccountFromDb,
    extractAccount,
};
