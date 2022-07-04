export class TItemProperty {
    type: string;
    path: string;
    name: string;
    cid: any;
    existed: boolean;
    pinned: boolean;
    located: boolean;
    size: number;
    locatedsize: number;
    locatedPercent: number;
    childItem: TItemProperty[];
}

export class TExportItem {
    sourcePath: string;
    targetpath: string;
    type: string;
    cid: any;
    sizeofFile: number;
    sizeofIpfs: number;
}
