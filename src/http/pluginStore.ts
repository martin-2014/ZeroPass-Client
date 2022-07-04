interface IPluginStore {
    openDetail: Message.Detail;
    personalList: any[];
    workList: any[];
    userProfileMessage: Message.ExtensionsMessage;
    openClientMachineDetail: Message.ClienMachineDetail[];
    loginFormExtension: boolean;
    windowFocusFn: () => void;
}

export const emptyUserProfileMessage: Message.ExtensionsMessage = {
    type: "ReturnUserProfileFromApp",
    message: {},
};

class PluginStore implements IPluginStore {
    private _openDetail: Message.Detail | null;
    private _personalList: any[] = [];
    private _workList: any[] = [];
    private _userProfileMessage: Message.ExtensionsMessage;
    private _openClientMachineDetail: Message.ClienMachineDetail[] = [];
    private _loginFormExtension: boolean = false;
    private _windowFocusFn: () => void;

    get openDetail() {
        return this._openDetail;
    }

    set openDetail(v: Message.Detail) {
        this._openDetail = v;
    }

    get personalList() {
        return this._personalList;
    }

    set personalList(v: any[]) {
        this._personalList = v;
    }

    get workList() {
        return this._workList;
    }

    set workList(v: any[]) {
        this._workList = v;
    }

    get userProfileMessage() {
        return this._userProfileMessage;
    }

    set userProfileMessage(v: Message.ExtensionsMessage) {
        this._userProfileMessage = v;
    }

    get openClientMachineDetail() {
        return this._openClientMachineDetail;
    }

    set openClientMachineDetail(v: Message.ClienMachineDetail[]) {
        this._openClientMachineDetail = v;
    }

    get loginFormExtension() {
        return this._loginFormExtension;
    }

    set loginFormExtension(v: boolean) {
        this._loginFormExtension = v;
    }

    get windowFocusFn() {
        return this._windowFocusFn;
    }

    set windowFocusFn(v: () => void) {
        this._windowFocusFn = v;
    }
}

export default new PluginStore();
