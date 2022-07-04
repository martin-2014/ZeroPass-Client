import { shell } from "electron";
import { exec, spawn, ExecException } from "child_process";

function htmlEncode(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&#34;")
        .replace(/\'/g, "&#39;");
}

const path = require("path");
export default function openAppEntry(url, browser: Message.BrowserType) {
    let cmd: string;
    switch (browser) {
        case "chrome":
            cmd = `start chrome.exe ${url}`;
            break;
        case "edge":
            cmd = `start msedge.exe ${url}`;
            break;
        case "firefox":
            cmd = `start firefox.exe ${url}`;
            break;
        default:
            if (
                !url.startsWith("http:") &&
                !url.startsWith("https:") &&
                !url.startsWith("www.")
            ) {
                url = `https://${url}`;
            }
            cmd = `start ${url}`;
    }

    return new Promise((resolve, reject) => {
        exec(
            cmd,
            { windowsHide: true, timeout: 1500 },
            (error: ExecException, stdout: string, stderr: string) => {
                if (error) {
                    reject(error);
                    resolve(1);
                } else {
                    resolve(0);
                }
            }
        );
    }).catch((err) => {
        console.log(err.message);
    });
}
