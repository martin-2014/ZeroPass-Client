declare namespace Utils {
    interface IClientInfo {
        wssPort?: number;
        readonly appName: string;
        readonly embeddedBrowserPath: string;
        readonly userAppDataPath: string;
        readonly userTempPath: string;
        readonly clientOS: string;
        readonly clientVersion: string;
        readonly clientMachineCode: string;
    }
}
