import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
    pwa?: boolean;
    logo?: string;
} = {
    title: 'ZeroPass',
    primaryColor: '#1890ff',
    layout: 'mix',
    contentWidth: 'Fluid',
    fixedHeader: false,
    fixSiderbar: true,
    colorWeak: false,
    pwa: false,
    iconfontUrl: '',
    menu: {
        defaultOpenAll: true,
        ignoreFlatMenu: true,
    },
};

export default Settings;
