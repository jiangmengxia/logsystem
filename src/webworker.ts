/**
 * logmanager部分由worker完成，尽可能减少对主任务的影响
 * 
 */

import LogManager from "./log_manager"
let logM = null

onmessage = (event) => {
    const { v, config, ...log } = event.data
    if (v === 'init') {
        if (config) {
            logM = LogManager.getInstance(config)
        }
    } else if (v === 'log') {
        // console.log("logM", logM)
        logM.regist(log)
    }
}