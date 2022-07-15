import { preloadCallback, initRenderEvent } from "./preloadCallBack";
import { contextBridge } from "electron";

window.addEventListener("DOMContentLoaded", () => {
    contextBridge.exposeInMainWorld("electron", preloadCallback);
});

initRenderEvent();
