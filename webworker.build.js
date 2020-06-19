const path = require('path')
const htmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require('webpack')
// console.log('process.env.ENV---', process.env.ENV)
const config = {
    mode: 'production',
    entry: {
        webworker: path.join(__dirname, './src/webworker.ts'),
    },
    output: {
        path: path.join(__dirname, './src/static'),
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
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
}

const process = require('process')
//chalk是一个颜色的插件   npmjs.com/package/chalk
const chalk = require('chalk')
webpack(config, (err, stats) => {
    if (err) throw err
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
        chunks: false,
        chunkModules: false
    }) + '\n\n')
    if (stats.hasErrors()) {
        console.log(chalk.red('  Build failed with errors.\n'))
        process.exit(1)
    }
    //build执行成功

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
        '  Tip: built files are meant to be served over an HTTP server.\n' +
        '  Opening index.html over file:// won\'t work.\n'
    ))
})
