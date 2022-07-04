import { IStartBrowserEvent } from '@/embeddedBrowser/nativeHost/electronHost/contextBridge/renderWorldDefine';
import { BrowserStatus } from '@/embeddedBrowser/embeddedbrowser/module/browserStatus';
import { IsPersonalItem, prependHttp } from '@/utils/tools';
import { TCryptoService } from '@/secretKey/cryptoService/cryptoService';
import { cryptoServiceAPI as restAPI } from '@/secretKey/cryptoService/api/cryptoService';
import { OpenDetail } from '@/services/api/logins';

export type AppBrief = {
    id: number;
    address: string;
    account: string;
    password: string;
    name: string;
};

export type ContainerBrief = {
    userId: string;
    containerId: string;
    containerName: string;
    networkId: string;
    token: string;
};

export type ProxyBrief = {
    ip: string;
    type: string;
    region: string;
    timezone: string;
};

export class AppItem {
    domainId?: number;
    type?: Message.openDefaultBrowserType;
    proxyBrief?: ProxyBrief;
    appBrief: AppBrief;
    containerBrief?: ContainerBrief;

    constructor(openDetail: OpenDetail) {
        this.appBrief = {
            id: openDetail?.id!,
            address: openDetail?.address!,
            account: openDetail?.loginUser!,
            password: openDetail?.loginPassword!,
            name: openDetail?.name!,
        };

        const machine = openDetail?.machineEnvData;
        if (machine !== undefined && machine !== null) {
            this.containerBrief = {
                userId: machine.userId,
                containerId: machine.containerId,
                containerName: machine.containerName,
                networkId: machine.networkId,
                token: machine.accessToken,
            };

            this.proxyBrief = {
                ip: machine.proxyBriefData.ip,
                type: machine.proxyBriefData.type,
                region: machine.proxyBriefData.region,
                timezone: machine.proxyBriefData.timezone,
            };
        }
    }
}

export class BrowserEvent implements IStartBrowserEvent {
    public onBeforeStarting = () => {};
    public onProgress = (progress: number) => {};
    public onStartedCompleted = (successful: boolean) => {};
    public onClose = () => {};
    public onResponse = (isSuccessful: boolean, data: Object) => {};
}

export const openBrowser = (appInfo: AppItem, browserEvent: BrowserEvent) => {
    appInfo.appBrief.address = prependHttp(appInfo.appBrief.address);
    if (appInfo.containerBrief?.containerId === undefined) {
        const openDetail: Message.Detail = {
            account: '',
            password: '',
            uri: appInfo.appBrief.address,
            domainId: appInfo.domainId!,
            type: appInfo.type,
        };
        if (appInfo.type == 'fill') {
            openDetail.account = appInfo.appBrief.account!;
            openDetail.password = appInfo.appBrief.password!;
        }
        openDefaultBrowser(openDetail);
    } else {
        openFingerprintBrowser(appInfo, browserEvent);
    }
};

const openFingerprintBrowser = async (appInfo: AppItem, browserEvent: BrowserEvent) => {
    const openDetail: Message.ClienMachineDetail = {
        account: appInfo.appBrief.account!,
        password: appInfo.appBrief.password!,
        uri: appInfo.appBrief.address,
        domainId: appInfo.domainId!,
        containerid: appInfo.containerBrief?.containerId!,
    };
    if (window.electron) {
        await decrypt(openDetail);
        electron.openClientMachineApp(openDetail);
        window.EmbeddedBrowser.start(appInfo, browserEvent.onResponse, browserEvent);
    }
};
const decrypt = async (openDetail: Message.Detail) => {
    const cryptoService = new TCryptoService();
    if (openDetail.password != '') {
        openDetail.password = await cryptoService.decryptText(
            openDetail.password,
            IsPersonalItem(openDetail.domainId),
        );
    }
};
const openDefaultBrowser = async (openDetail: Message.Detail) => {
    await decrypt(openDetail);
    window.electron.openApp(openDetail);
};

export interface ListBrowserStatusResult {
    Successful: boolean;
    Status: BrowserStatus[];
}

export const stopAllBrowser = () => {
    window.EmbeddedBrowser?.stopAll((isSsuccessful: boolean, data: any) => {
        console.log('Close all browser reponse:', isSsuccessful);
    });
};

export const listAllBrowserStatus = async (): Promise<ListBrowserStatusResult> => {
    return new Promise((resolve) => {
        window.EmbeddedBrowser.getAllStatus((isSuccessful: boolean, payload: any) => {
            console.log('Get all browser status ', isSuccessful);
            let result: ListBrowserStatusResult = {
                Successful: isSuccessful,
                Status: payload,
            };
            resolve(result);
        });
    });
};

export const listAllBrowserStatusSync = (): Iterable<BrowserStatus> => {
    return window.EmbeddedBrowser.getAllStatusSync();
};
