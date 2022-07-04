import ClientInfo from "./client-info";

function aesEncrypt(json) {
    const Rijndael = require("rijndael-js");
    const padder = require("pkcs7-padding");
    var key = [
        0x55, 0x4a, 0xba, 0xe4, 0xcc, 0x66, 0x2e, 0x2c, 0xb0, 0x73, 0x46, 0xdc,
        0xf3, 0x9f, 0xe2, 0x3e,
    ];
    var iv = [
        0xcc, 0x4b, 0x20, 0x66, 0xcf, 0xef, 0x89, 0xf2, 0x47, 0x5d, 0xe1, 0xd4,
        0xda, 0x4b, 0x29, 0xc7,
    ];
    const cipher = new Rijndael(key, "cbc");
    const padded1 = padder.pad(json, 16);
    const ciphertext1 = Buffer.from(cipher.encrypt(padded1, 128, iv));
    var result = ciphertext1.toString("base64");
    return result;
}

export default function checkProxy(proxyJson) {
    const path = require("path");
    const proxyTester = path.join(
        ClientInfo.getInstance().embeddedBrowserPath,
        "sdk-proxy.exe"
    );
    var aesRsult = aesEncrypt(proxyJson);

    return new Promise((resolve, reject) => {
        require("child_process").execFile(
            proxyTester,
            ["2", aesRsult],
            { windowsHide: true },
            function (err, stdout, stderr) {
                if (err) {
                    reject(err);
                }
                var checkResult = JSON.parse(stdout);
                resolve(checkResult);
            }
        );
    }).catch((err) => {
        console.log("caught", err.message);
    });
}
