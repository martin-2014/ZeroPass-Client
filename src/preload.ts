import { preloadCallback, initRenderEvent } from "./preloadCallback";
import { contextBridge } from "electron";

window.addEventListener("DOMContentLoaded", () => {
    contextBridge.exposeInMainWorld("electron", preloadCallback);
});

initRenderEvent();
