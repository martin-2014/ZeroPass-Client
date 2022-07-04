const logger = require("electron-log");
const fs = require("fs-extra");
const { join } = require("path");
const store = require("../common/store");
const { STATUS } = require("./consts");
const createDaemon = require("./daemon");

module.exports = async function (ctx, repoPath) {
    let ipfsd = null;
    let status = null;

    const updateStatus = (stat, id = null) => {
        status = stat;
        if (ctx.onDaemonStatus !== undefined) {
            ctx.onDaemonStatus(stat);
        }
    };

    const getIpfsd = async (optional = false) => {
        if (optional) {
            return ipfsd;
        }

        if (!ipfsd) {
            logger.verbose(`[daemon] wait IPFS daemon running`);
            await startIpfs();
        }

        return ipfsd;
    };

    const runAndStatus = (fn) => async () => {
        await fn();
        return status;
    };

    const startIpfs = async () => {
        if (ipfsd) {
            return;
        }

        logger.debug("[ipfsd] start daemon process");
        const config = store.get("ipfsConfig");
        config.path = repoPath;
        config.peers = ctx.peers;

        updateStatus(STATUS.STARTING_STARTED);
        const res = await createDaemon(config);

        if (res.err) {
            logger.error("[ipfsd] start daemon finished with error:", res.err);
            updateStatus(STATUS.STARTING_FAILED);
            return;
        }

        ipfsd = res.ipfsd;
        // Update the path if it was blank previously.
        // This way we use the default path when it is
        // not set.
        if (!config.path || typeof config.path !== "string") {
            config.path = ipfsd.path;
            store.set("ipfsConfig", config);
        }

        logger.debug("[ipfsd] start daemon finished");
        updateStatus(STATUS.STARTING_FINISHED, res.id);
    };

    const stopIpfs = async () => {
        if (!ipfsd) {
            return;
        }

        logger.debug("[ipfsd] stop daemon");
        updateStatus(STATUS.STOPPING_STARTED);

        if (!fs.pathExistsSync(join(ipfsd.path, "config"))) {
            // Is remote api... ignore
            ipfsd = null;
            updateStatus(STATUS.STOPPING_FINISHED);
            return;
        }

        try {
            await ipfsd.stop();
            logger.debug("[ipfsd] stop daemon finished");
            updateStatus(STATUS.STOPPING_FINISHED);
        } catch (err) {
            logger.error(
                "[ipfsd] stop daemon finished with error:",
                err.toString()
            );
            updateStatus(STATUS.STOPPING_FAILED);
        } finally {
            ipfsd = null;
        }
    };

    const restartIpfs = async () => {
        await stopIpfs();
        await startIpfs();
    };

    ctx.startIpfs = runAndStatus(startIpfs);
    ctx.stopIpfs = runAndStatus(stopIpfs);
    ctx.restartIpfs = runAndStatus(restartIpfs);
    ctx.getIpfsd = getIpfsd;
};
