
import LogManager from "../src/log_manager";
import LogRegister from '../src/log_register'

import { LogItem, LogConfig, Method, RET } from "../src/interface";
import { timestampToDateTime } from "../src/lib/utils";
import { DBLogItem } from "../src/log_db";
const url = 'http://127.0.0.1:7001/api/log'
// const wrongUrl = "http://47.101.37.38:38080/app/mock/22"
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
const useWorker = false
const logBatchNum = 100



const config: LogConfig = {
    useWorker,
    url,
    method: Method.POST,
    headers: {
        'jzx-appid': "",
        'ACCESS_TOKEN': ""
    },
    repeat: 0,
    duration: 1000,
    DBName: '_my_db_',
    metaData,
    handleResponse: (responseData: string) => { // 返回{ok,data,error}
        console.log('handleResponse responseData', responseData)
        const data = JSON.parse(responseData)
        return { ret: data.isOk ? RET.SUCCESS : RET.FAILED, error: data.errMsg }
    },
    handleRequest: (log: DBLogItem) => {//相当于日志的封装
        console.log('handleRequest', log)
        return {
            data: {
                ...log,
                ...metaData
            }
        }
    }
}

//测试用
export function logRegist(logConfig: LogConfig) {
    const lr = new LogRegister(logConfig)
    return lr  //lr 使用report上传日志   直接调用lr.report(log:LogItem)
}


const lr = logRegist(config)


// setTimeout(() => {
//     lr.report({ type: 'test_webworker', content: 'log1  webworker' })
// }, 1000)

const input = document.createElement('input')
const button = document.createElement('button')
const select = document.createElement('select')
const op1 = document.createElement('option')
op1.value = "1" //立即发送
op1.label = "立即发送"
const op2 = document.createElement('option')
op2.value = "2" //立即发送
op2.label = "非立即发送"
select.value="1"
select.appendChild(op1)
select.appendChild(op2)
button.innerHTML = '确定发送'
document.body.append(input)
document.body.append(select)
document.body.append(document.createElement('br'))
document.body.append(document.createElement('br'))
document.body.append(button)

button.onclick = () => {
    if (input.value === '') {
        return
    }
    lr.report({
        type: `timer_${Date.now()}`,
        content: input.value,
        isImmediate: select.value === "1" ? true : false
    })
}