const Ctl = require("ipfsd-ctl");
const logger = require("electron-log");
const {
    applyDefaults,
    migrateConfig,
    checkPorts,
    configExists,
    checkValidConfig,
    rmApiFile,
    apiFileExists,
} = require("./config");
const path = require("path");
const { app } = require("electron");

const { NODE_ENV } = process.env;
const appPath =
    NODE_ENV === "deve" ? process.cwd() : path.dirname(app.getPath("exe"));

const ipfsPath = path.resolve(appPath, "./resources", "ipfs.exe");

function getIpfsBinPath() {
    console.log("ipfs path", ipfsPath);
    return process.env.IPFS_GO_EXEC || ipfsPath;
}

async function spawn(ipfsOption) {
    const ipfsBin = getIpfsBinPath();

    logger.verbose("ipfs bin path:", ipfsBin);
    logger.verbose("ipfs option", ipfsOption);

    const ipfsd = await Ctl.createController({
        ipfsHttpModule: require("ipfs-http-client"),
        ipfsBin,
        ipfsOptions: {
            repo: ipfsOption.path,
        },
        remote: false,
        disposable: false,
        test: false,
        args: ipfsOption.flags,
    });

    if (!checkValidConfig(ipfsd)) {
        throw new Error(`repository at ${ipfsd.path} is invalid`);
    }

    if (configExists(ipfsd)) {
        //apply default for each started
        applyDefaults(ipfsd, ipfsOption);
        return { ipfsd, isRemote: false };
    }

    // If config does not exist, but $IPFS_PATH/api exists, then
    // it is a remote repository.
    if (apiFileExists(ipfsd)) {
        return { ipfsd, isRemote: true };
    }

    logger.verbose("ipfsd init");
    await ipfsd.init({ emptyRepo: true });

    applyDefaults(ipfsd, ipfsOption);
    migrateConfig(ipfsd);

    return { ipfsd, isRemote: false };
}

function listenToIpfsLogs(ipfsd, callback) {
    let stdout, stderr;

    const listener = (data) => {
        callback(data.toString());
    };

    const interval = setInterval(() => {
        if (!ipfsd.subprocess) {
            return;
        }

        stdout = ipfsd.subprocess.stdout;
        stderr = ipfsd.subprocess.stderr;

        stdout.on("data", listener);
        stderr.on("data", listener);

        clearInterval(interval);
    }, 20);

    const stop = () => {
        clearInterval(interval);

        if (stdout) stdout.removeListener("data", listener);
        if (stderr) stderr.removeListener("data", listener);
    };

    return stop;
}

async function startIpfsWithLogs(ipfsd) {
    let err, id, migrationPrompt;
    let isMigrating, isErrored, isFinished;
    let logs = "";

    const isSpawnedDaemonDead = (ipfsd) => {
        if (typeof ipfsd.subprocess === "undefined")
            throw new Error(
                "undefined ipfsd.subprocess, unable to reason about startup errors"
            );
        if (ipfsd.subprocess === null) return false; // not spawned yet or remote
        if (ipfsd.subprocess?.failed) return true; // explicit failure

        // detect when spawned ipfsd process is gone/dead
        // by inspecting its pid - it should be alive
        const { pid } = ipfsd.subprocess;
        try {
            // signal 0 throws if process is missing, noop otherwise
            process.kill(pid, 0);
            return false;
        } catch (e) {
            return true;
        }
    };

    const stopListening = listenToIpfsLogs(ipfsd, (data) => {
        logs += data.toString();
        const line = data.toLowerCase();
        isMigrating = isMigrating || line.includes("migration");
        isErrored = isErrored || isSpawnedDaemonDead(ipfsd);
        isFinished = isFinished || line.includes("daemon is ready");

        if (!isMigrating && !isErrored) {
            logger.verbose(
                "[daemon] no migrating and no error: ",
                data.toString()
            );
            return;
        }

        if (!migrationPrompt) {
            logger.verbose("[daemon] ipfs data store is migrating");
            migrationPrompt = true;
            return;
        }

        if (isErrored || isFinished) {
            // forced show on error or when finished,
            // because user could close it to run in background
            logger.debug("[daemon] ipfs daemon completed:", isFinished);
        } else {
            // update progress if the window is still around
            logger.verbose(logs);
            logger.verbose(
                "[daemon] ipfs daemon progress update:",
                data.toString()
            );
        }
    });

    try {
        await ipfsd.start();
        const idRes = await ipfsd.api.id();
        id = idRes.id;
    } catch (e) {
        err = e;
    } finally {
        // stop monitoring daemon output - we only care about startup phase
        stopListening();

        // Show startup error using the same UI as migrations.
        // This is catch-all that will show stdout/stderr of ipfs daemon
        // that failed to start, allowing user to self-diagnose or report issue.
        isErrored = isErrored || isSpawnedDaemonDead(ipfsd);
        if (isErrored) {
            // save daemon output to error.log
            if (logs.trim().length === 0) {
                logs =
                    "ipfs daemon failed to start and produced no output (see error.log for details)";
            }
            logger.error(logs);
        }
    }

    return {
        err,
        id,
        logs,
    };
}

module.exports = async function (ipfsOption) {
    let ipfsd, isRemote;

    try {
        const res = await spawn(ipfsOption);
        ipfsd = res.ipfsd;
        isRemote = res.isRemote;
    } catch (err) {
        return { err: err.toString() };
    }

    if (!isRemote) {
        try {
            await checkPorts(ipfsd);
        } catch (err) {
            return { err };
        }
    }

    let errLogs = await startIpfsWithLogs(ipfsd);
    if (errLogs.err) {
        if (
            !errLogs.err.message.includes("ECONNREFUSED") &&
            !errLogs.err.message.includes("ERR_CONNECTION_REFUSED")
        ) {
            return { ipfsd, err: errLogs.err, logs: errLogs.logs };
        }

        if (!configExists(ipfsd)) {
            logger.error(
                "IPFS Desktop cannot connect to the API address provided: ",
                ipfsd.apiAddr.toString()
            );
            return { ipfsd, err: errLogs.err, logs: errLogs.logs };
        }

        logger.verbose("[daemon] removing api file");
        rmApiFile(ipfsd);

        errLogs = await startIpfsWithLogs(ipfsd);
    }

    return { ipfsd, err: errLogs.err, logs: errLogs.logs, id: errLogs.id };
};
