const { join } = require("path");
const fs = require("fs-extra");
const { multiaddr } = require("multiaddr");
const http = require("http");
const portfinder = require("portfinder");
const store = require("../common/store");
const logger = require("electron-log");

function configExists(ipfsd) {
    return fs.pathExistsSync(join(ipfsd.path, "config"));
}

function apiFileExists(ipfsd) {
    return fs.pathExistsSync(join(ipfsd.path, "api"));
}

function rmApiFile(ipfsd) {
    return fs.removeSync(join(ipfsd.path, "api"));
}

function configPath(ipfsd) {
    return join(ipfsd.path, "config");
}

function readConfigFile(ipfsd) {
    return fs.readJsonSync(configPath(ipfsd));
}

function writeConfigFile(ipfsd, config) {
    fs.writeJsonSync(configPath(ipfsd), config, { spaces: 2 });
}

// Set default minimum and maximum of connections to maintain
// by default. This must only be called for repositories created
// by IPFS Desktop. Existing ones shall remain intact.
function applyDefaults(ipfsd, ipfsOption) {
    const config = readConfigFile(ipfsd);

    // Ensure strict CORS checking
    // See: https://github.com/ipfs/js-ipfsd-ctl/issues/333
    config.API = config.API || {};

    config.Swarm = config.Swarm || {};
    config.Swarm.DisableNatPortMap = false;
    config.Swarm.EnableHolePunching = true;
    config.Swarm.ConnMgr = config.Swarm.ConnMgr || {};
    config.Swarm.ConnMgr.Type = "basic";
    config.Swarm.ConnMgr.GracePeriod = "3m";
    config.Swarm.ConnMgr.LowWater = 20;
    config.Swarm.ConnMgr.HighWater = 40;

    config.Swarm.RelayClient = config.Swarm.RelayClient || {};
    config.Swarm.RelayClient.Enabled = true;

    config.Routing = config.Routing || {};
    config.Routing.Type = "dht";

    config.Discovery = config.Discovery || {};
    config.Discovery.MDNS = config.Discovery.MDNS || {};
    config.Discovery.MDNS.Enabled = true;

    if (ipfsOption.peers !== undefined) {
        const peers = [];
        for (const peerItem of ipfsOption.peers) {
            peers.push({ ID: peerItem });
        }
        config.Peering.Peers = peers;
    }

    writeConfigFile(ipfsd, config);
}

const getRpcApiPort = (config) => getHttpPort(config.Addresses.API);
const getGatewayPort = (config) => getHttpPort(config.Addresses.Gateway);
function getHttpPort(addrs) {
    let httpUrl = null;

    if (Array.isArray(addrs)) {
        httpUrl = addrs.find((v) => v.includes("127.0.0.1"));
    } else {
        httpUrl = addrs;
    }

    const gw = parseCfgMultiaddr(httpUrl);
    return gw.nodeAddress().port;
}

// Apply one-time updates to the config of IPFS node.
// This is the place where we execute fixes and performance tweaks for existing users.
function migrateConfig(ipfsd) {
    // Bump revision number when new migration rule is added
    const REVISION = 4;
    const REVISION_KEY = "daemonConfigRevision";
    const CURRENT_REVISION = store.get(REVISION_KEY, 0);

    logger.verbose("the current repository version:", CURRENT_REVISION);
    // Migration is applied only once per revision
    //if (CURRENT_REVISION >= REVISION) return

    // Read config
    let config = null;
    let changed = false;
    try {
        config = readConfigFile(ipfsd);
    } catch (err) {
        // This is a best effort check, dont blow up here, that should happen else where.
        logger.error(
            `[daemon] migrateConfig: error reading config file: ${
                err.message || err
            }`
        );
        return;
    }

    if (CURRENT_REVISION < 1) {
        // Cleanup https://github.com/ipfs-shipyard/ipfs-desktop/issues/1631
        if (
            config.Discovery &&
            config.Discovery.MDNS &&
            config.Discovery.MDNS.enabled
        ) {
            config.Discovery.MDNS.Enabled =
                config.Discovery.MDNS.Enabled || true;
            delete config.Discovery.MDNS.enabled;
            changed = true;
        }
    }

    if (CURRENT_REVISION < 3) {
        changed = updateApiCors(config);
    }

    if (CURRENT_REVISION < 4) {
        // lower ConnMgr https://github.com/ipfs/ipfs-desktop/issues/2039
        const { GracePeriod, LowWater, HighWater } = config.Swarm.ConnMgr;
        if (GracePeriod === "300s") {
            config.Swarm.ConnMgr.GracePeriod = "1m";
            changed = true;
        }
        if (LowWater > 20) {
            config.Swarm.ConnMgr.LowWater = 20;
            changed = true;
        }
        if (HighWater > 40) {
            config.Swarm.ConnMgr.HighWater = 40;
            changed = true;
        }
    }

    if (changed) {
        try {
            writeConfigFile(ipfsd, config);
            //store.set(REVISION_KEY, REVISION)
        } catch (err) {
            logger.error(
                `[daemon] migrateConfig: error writing config file: ${
                    err.message || err
                }`
            );
            return;
        }
    }
    //store.set(REVISION_KEY, REVISION)
}

const parseCfgMultiaddr = (addr) =>
    addr.includes("/http")
        ? multiaddr(addr)
        : multiaddr(addr).encapsulate("/http");

function updateApiCors(config) {
    const api = config.API || {};
    const httpHeaders = api.HTTPHeaders || {};
    const accessControlAllowOrigin =
        httpHeaders["Access-Control-Allow-Origin"] || [];

    const addURL = (url) => {
        if (!accessControlAllowOrigin.includes(url)) {
            accessControlAllowOrigin.push(url);
            return true;
        }
        return false;
    };

    const addedWebUI = addURL("https://webui.ipfs.io");
    const addedGw = addURL(
        `http://webui.ipfs.io.ipns.localhost:${getGatewayPort(config)}`
    );

    // https://github.com/ipfs/ipfs-companion/issues/1068 in go-ipfs <0.13
    // TODO: remove addedApiPort after go-ipfs 0.13 ships
    const addedApiPort = addURL(`http://127.0.0.1:${getRpcApiPort(config)}`);

    if (addedWebUI || addedGw || addedApiPort) {
        httpHeaders["Access-Control-Allow-Origin"] = accessControlAllowOrigin;
        api.HTTPHeaders = httpHeaders;
        config.API = api;
        return true;
    }

    return false;
}

async function checkIfAddrIsDaemon(addr) {
    const options = {
        timeout: 3000, // 3s is plenty for localhost request
        method: "POST",
        host: addr.address,
        port: addr.port,
        path: "/api/v0/refs?arg=/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",
    };

    return new Promise((resolve) => {
        const req = http.request(options, function (r) {
            resolve(r.statusCode === 200);
        });

        req.on("error", () => {
            resolve(false);
        });

        req.end();
    });
}

const findFreePort = async (port) => {
    port = Math.max(port, 1024);
    const basePort = port;
    const highestPort = basePort + 1000;
    return portfinder.getPortPromise({ port: basePort, stopPort: highestPort });
};

async function checkPortsArray(originalAddress, skipPort) {
    var multiAddress;
    if (Array.isArray(originalAddress) === false) {
        multiAddress = [originalAddress];
    } else {
        multiAddress = originalAddress.filter(Boolean);
    }

    const freeAddress = [];
    for await (const addressItem of multiAddress) {
        const objAddress = parseCfgMultiaddr(addressItem);
        const port = parseInt(objAddress.nodeAddress().port, 10);

        let freePort = await findFreePort(port);
        if (skipPort !== undefined) {
            while (skipPort.includes(freePort)) {
                freePort = await findFreePort(freePort + 1);
            }
        }

        var ret = {
            busy: port !== freePort,
            port: freePort,
            addr:
                port === freePort
                    ? addressItem
                    : addressItem.replace(port.toString(), freePort.toString()),
        };
        freeAddress.push(ret);
    }

    if (Array.isArray(originalAddress) === false) {
        return freeAddress[0];
    }

    return freeAddress;
}

async function checkPorts(ipfsd) {
    const config = readConfigFile(ipfsd);

    const apiIsArr = Array.isArray(config.Addresses.API);
    const gatewayIsArr = Array.isArray(config.Addresses.Gateway);

    if (apiIsArr || gatewayIsArr) {
        throw new Error("Does not support multi API or Gateway address");
    }

    const configApiMultiAddress = parseCfgMultiaddr(config.Addresses.API);
    const configGatewayMultiAddress = parseCfgMultiaddr(
        config.Addresses.Gateway
    );

    const isApiMaDaemon = await checkIfAddrIsDaemon(
        configApiMultiAddress.nodeAddress()
    );
    const isGatewayMaDaemon = await checkIfAddrIsDaemon(
        configGatewayMultiAddress.nodeAddress()
    );

    if (isApiMaDaemon && isGatewayMaDaemon) {
        logger.debug(
            "[daemon] ports used by a ipfs daemon, select another free port"
        );
        //return
    }
    const apiAddress = await checkPortsArray(config.Addresses.API);
    const gateAddress = await checkPortsArray(config.Addresses.Gateway, [
        apiAddress.port,
    ]);
    const swarmAddress = await checkPortsArray(config.Addresses.Swarm, [
        apiAddress.port,
        gateAddress.port,
    ]);

    if (
        !apiAddress.busy &&
        !gateAddress &&
        swarmAddress.every((element) => element.busy === false)
    ) {
        logger.debug("ports are free and can be used");
        return;
    }

    if (apiAddress.busy) {
        logger.debug("api port use the new port:", apiAddress.port);
        config.Addresses.API = apiAddress.addr;
        updateApiCors(config);
        rmApiFile(ipfsd);
    }
    if (gateAddress.busy) {
        logger.debug("gateway port use the new port:", gateAddress.port);
        config.Addresses.Gateway = gateAddress.addr;
    }
    if (!swarmAddress.every((element) => element.busy === false)) {
        logger.debug("swarm port use the new address:", swarmAddress);
        let swarmAddr = [];
        for (const addressItem of swarmAddress) {
            swarmAddr.push(addressItem.addr);
        }

        config.Addresses.Swarm = swarmAddr;
    }

    writeConfigFile(ipfsd, config);
}

function checkValidConfig(ipfsd) {
    if (!fs.pathExistsSync(ipfsd.path)) {
        // If the repository doesn't exist, skip verification.
        return true;
    }

    try {
        const stats = fs.statSync(ipfsd.path);
        if (!stats.isDirectory()) {
            throw new Error("IPFS_PATH must be a directory");
        }

        if (!configExists(ipfsd)) {
            // Config is generated automatically if it doesn't exist.
            return true;
        }

        // This should catch errors such having no configuration file,
        // IPFS_DIR not being a directory, or the configuration file
        // being corrupted.
        readConfigFile(ipfsd);
        return true;
    } catch (e) {
        // Save to error.log
        logger.error(e);
    }
}

module.exports = Object.freeze({
    configPath,
    configExists,
    apiFileExists,
    rmApiFile,
    applyDefaults,
    migrateConfig,
    checkPorts,
    checkValidConfig,
});
