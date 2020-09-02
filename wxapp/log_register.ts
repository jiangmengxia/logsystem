import LogManager from "./log_manager"
import { LogConfig, LogItem } from "./interface"
import log_configer from "./log_configer"
//单例
class LogRegister {
    private manager: LogManager = null

    constructor(config: LogConfig) {
        this.init(config)
    }
    //配置项
    async init(config: LogConfig) {
        log_configer.set(config)
        return new Promise((resolve) => {
            this.manager = LogManager.getInstance(() => {
                resolve('ok')
            })
        })
    }

    report(log: LogItem) {
        (this.manager as LogManager).regist(log)
    }
}

export default LogRegister