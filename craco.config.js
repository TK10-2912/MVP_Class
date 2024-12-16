const { when, whenDev, whenProd, whenCI, whenTest, ESLINT_MODES, POSTCSS_MODES } = require('@craco/craco');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CracoAntDesignPlugin = require('craco-antd');
const webpack = require('webpack');

const path = require(`path`);

const tsconfig = require('./tsconfig.paths.json')

const removeAsterisk = path => path.replace('/*', '')

const aliasProps = Object.entries(tsconfig.compilerOptions.paths).map(([key, value]) => {
    const newKey = removeAsterisk(key)
    let newValue = removeAsterisk(value[0])
    newValue = path.resolve(__dirname, newValue)
    return [newKey, newValue]
})

const alias = Object.fromEntries(aliasProps)
module.exports = {
    plugins: [{
        plugin: CracoAntDesignPlugin,
        options: {
            customizeTheme: {
                '@primary-color': '#1DA57A',
                '@link-color': '#1DA57A',
            },
        },
    }, ],
    webpack: {
        alias,
        plugins: [],
        configure: (webpackConfig, { env, paths }) => {
            if (!webpackConfig.plugins) {
                config.plugins = [];
            }
            webpackConfig.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser.js',
                }),
            );
            webpackConfig.plugins.push(
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                }),
            );
            webpackConfig.plugins.push(
                process.env.NODE_ENV === 'production' ?
                new CopyWebpackPlugin([{
                        from: 'node_modules/@aspnet/signalr/dist/browser/signalr.min.js',
                    },
                    // {
                    //     from: 'node_modules/abp-web-resources/Abp/Framework/scripts/libs/abp.signalr-client.js',
                    // },
                    {
                        from: "src/lib/abp.signalr-client.js"
                    },
                    {
                        from: 'src/lib/abp.js',
                    },
                ]) :
                new CopyWebpackPlugin([{
                        from: 'node_modules/@aspnet/signalr/dist/browser/signalr.min.js',
                    },
                    // {
                    //     from: 'node_modules/abp-web-resources/Abp/Framework/scripts/libs/abp.signalr-client.js',
                    //     to: 'dist/abp.signalr-client.js'
                    // },
                    {
                        from: "src/lib/abp.signalr-client.js"
                    },
                    {
                        from: 'src/lib/abp.js',
                    },
                ]),
            );

            return webpackConfig;
        },
    },
};