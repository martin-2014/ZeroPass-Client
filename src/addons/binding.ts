const addon = require("./addon32.node");

export interface IEnumWindows {
    (callback: (img: any) => void): void;
}

export const enumTopWindows: IEnumWindows = addon.enumWindows.enumTopWindows;
