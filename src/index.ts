
import LogManager from "./log_manager";
import LogRegister from './log_register'


import { LogItem, LogConfig, Method } from "./interface";
import { timestampToDateTime } from "./lib/utils";
const url = 'http://47.101.37.38:38080/app/mock/22/kxd/hera/user/add'
const wrongUrl = "http://47.101.37.38:38080/app/mock/22"
const metaData = {
    userId: "",
    token: "",
    clientTime: "",
    // versionName?: string | "仅APP提供",
    // versionCode?: string | "仅APP提供",
    // location?: string | "仅APP提供",
    // cityCode?: string | "仅APP提供",
    // adCode?: string | "仅APP提供",
    networkStatus: "",
    // 单次启动应用到关闭应用周期内的标识
    appSessionId: "",
    // 打开页面到关闭/离开页面周期内的标识
    pageSessionId: "",
    // 当前页面ID :安卓是包路径+类名，H5是URL
    pageId: "",
    pageTitle: ""
}
const useWorker: boolean = false
const logBatchNum: number = 100

//测试
testStoreLog(useWorker)


//测试存数据
function testStoreLog(useWorker: boolean) {
    let button = document.createElement('button')
    button.innerText = "批量发送log"
    button.addEventListener('click', () => {
        startLog(useWorker)
    })


    document.body.append(button)
    let button_ = document.createElement('button')
    button_.innerText = "每日上报"

    button_.addEventListener('click', () => {
        let logM: LogManager = LogManager.getInstance({ url: wrongUrl, metaData: metaData })
    })
    document.body.append(button_)
}

/********************************************* */

function startLog(useWorker: Boolean = false) {
    console.info('开始计时：', Date.now())
    let c = 1
    let inter = setInterval(() => {
        if (c <= logBatchNum) {
            console.log(`send No.${c} LOG`)
            logRegist({ type: `NO.${c}__`, content: `NO.${c}__${timestampToDateTime()}` }, useWorker)
            c++
        }
        else {
            clearInterval(inter)
            return
        }
    })
}


//测试用
function logRegist(log: LogItem, useWorker: Boolean = false) {
    const lr = LogRegister.getInstance({
        useWorker: <boolean>useWorker,
        url,
        method: Method.POST,
        metaData
    })
    lr.report(log)
}