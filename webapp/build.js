/*
 * @Description: 
 * @Author: Ymh
 * @Date: 2019-09-28 10:43:23
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-11-15 14:18:16
 */
//主要用来实现node.js命令行环境的loading效果，和显示各种状态的图标等  https://www.npmjs.com/package/ora
const ora = require('ora')
//chalk是一个颜色的插件   npmjs.com/package/chalk
const chalk = require('chalk')

//递归删除文件的node插件，在项目的文件编译之前，可以清除dist文件夹里的内容 https://www.npmjs.com/package/rimraf
const rimraf = require('rimraf')
//process模块用来与当前进程互动，可以通过全局变量process访问，不必使用require命令加载。它是一个EventEmitter对象的实例。
const process = require('process')
const path = require('path')
const webpack = require('webpack')
const webpackConfig = require('./webpack.conf')//process.env.NODE_ENV === 'production' ? require('./webpack.prod.conf') : require('./webpack.analyze.conf')


const spinner = ora(`building for ${process.env.NODE_ENV}...`)
spinner.start()


rimraf(path.join(__dirname, '../dist'), err => {
    if (err)
        throw (err)
    webpack(webpackConfig, (err, stats) => {
        spinner.stop()
        if (err) throw err
        //将stats输出到控制台
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
})