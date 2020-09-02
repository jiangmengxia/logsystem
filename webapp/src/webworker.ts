/**
 * logmanager部分由worker完成，尽可能减少对主任务的影响
 * 
 */

import LogManager from "./log_manager"
import log_configer from "./log_configer"  //全部变量在worker中不支持
// import { LogItem, LogConfig } from "./interface"
let logM = null

onmessage = (event: MessageEvent) => {
    const { v, log, config } = event.data
    if (v === 'init') {
        console.log('config----onmessage', JSON.parse(config))
        if (config) {
            log_configer.set(config)
            logM = LogManager.getInstance(() => {
                console.log('webworker logManger repared')
            })
        } else {
            console.error('请先配置config!')
        }
    } else if (v === 'log') {
        if (logM === null) {
            console.error('webworker logManger hasnot repared')
            return
        }
        logM.regist(log)
    }
}