// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
import path from 'path';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
    hash: true,
    antd: {},
    mock: false,
    dva: {
        hmr: true,
    },
    history: { type: 'hash' },
    layout: {
        locale: true,
        siderWidth: 200,
        ...defaultSettings,
    },
    locale: {
        default: 'en-US',
        antd: true,
        // default true, when it is true, will use `navigator.language` overwrite default
        baseNavigator: false,
    },
    dynamicImport: {
        loading: '@ant-design/pro-layout/es/PageLoading',
    },
    targets: {
        chrome: 97,
    },
    publicPath: './',
    routes,
    theme: {
        'primary-color': defaultSettings.primaryColor,
        'root-entry-name': 'default',
    },
    // esbuild is father build tools
    //esbuild: {},
    title: false,
    ignoreMomentLocale: true,
    proxy: proxy[REACT_APP_ENV || 'dev'],
    manifest: {
        basePath: '/',
    },
    fastRefresh: {},
    plugins: ['./plugins/urlPlugin'],
    nodeModulesTransform: { type: 'none' },
    mfsu: {},
    webpack5: {},
    exportStatic: {},
    extraBabelPlugins: [
        [
            'import',
            {
                libraryName: '@icon-park/react',
                libraryDirectory: 'es/icons',
                camel2DashComponentName: false,
            },
        ],
    ],
    chainWebpack: function (config) {
        config.merge({
            experiments: {
                asyncWebAssembly: true,
            },
        });
        config.resolve.alias.set('~@', path.resolve(__dirname, './src'));
        config.module
            .rule('otf')
            .test(/\.otf$/)
            .use('file-loader')
            .loader('file-loader');
    },
});
