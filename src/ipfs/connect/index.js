const logger = require("electron-log");

module.exports = function (ipfs, nodeId, prefix = "") {
    var stopped = false;
    var startScheduleJob = async () => {
        for (index = 0; index < 5; index++) {
            if (stopped) {
                break;
            }

            try {
                const peerId = "/p2p/" + nodeId;
                await ipfs.swarm.connect(peerId, { timeout: 120000 });
                return true;
            } catch (err) {
                if (stopped) {
                    break;
                }

                if (index === 4) {
                    logger.error(`${err.message}`);
                } else {
                    logger.warn(`${err.message}, retry again. `);
                }
            }
        }
    };

    logger.debug(
        `start ${prefix} schedule job which connect to peer ${nodeId}`
    );
    startScheduleJob();
    var scheduleJobTimer = setInterval(() => {
        stopped = false;
        startScheduleJob();
    }, 45000);

    var stopScheduleJob = () => {
        logger.debug(
            `stop ${prefix} schedule job which connect to peer ${nodeId}`
        );
        clearInterval(scheduleJobTimer);
        stopped = true;
    };

    return stopScheduleJob;
};
