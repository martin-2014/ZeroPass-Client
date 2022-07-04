const path = require("path");
const { doSign } = require("app-builder-lib/out/codeSign/windowsCodeSign");

/**
 * @type {import("electron-builder").CustomWindowsSign} sign
 */
module.exports = async function sign(config, packager) {
    // Do not sign if no certificate is provided.
    if (!config.cscInfo) {
        return;
    }

    const targetPath = config.path;
    const ext = path.extname(targetPath);

    if (
        (targetPath.indexOf("ZeroPass") != -1 ||
            targetPath.indexOf("ext-native") != -1) &&
        ext == ".exe"
    ) {
        console.log("confirm signing:" + targetPath);
        await doSign(config, packager);
    } else {
        return;
    }
};
