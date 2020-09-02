const path = require('path')
const htmlWebpackPlugin = require("html-webpack-plugin")
const copyWebpackPlugin = require('copy-webpack-plugin')
console.log('process.env.ENV---', process.env.ENV)
console.log('MV_NONEED_LOGS', process.env.MV_NONEED_LOGS)
const config = {
    mode: process.env.ENV === 'dev' ? 'development' : 'production',
    entry: {
        app: path.join(__dirname, './demo/index.ts'),
    },
    output: {
        path: path.join(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[name].[chunkhash].js',
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" },
            // { test: /\.js?$/, loader: "babel-loader" }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "./dist"),
        port: '9900',
        compress: true,
        inline:true,
        proxy: {
            '/api': {
                target: "http://127.0.0.1:7001",
                changeOrigin: true,
                pathRewrite: {// 如果接口本身没有/api需要通过pathRewrite来重写了地址
                    '^/api': ''
                }
            }
        }
    },
    plugins: [
        new htmlWebpackPlugin({
            inject: true,
        }),
        new copyWebpackPlugin(
            {
                patterns: [
                    {
                        from: path.join(__dirname, "./src/static"),
                        to: path.join(__dirname, "./dist"),
                    },
                ],
            }
        )
    ]
}

module.exports = config