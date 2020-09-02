import LogManager from "./log_manager"
import { LogConfig, LogItem } from "./interface"
import log_configer from "./log_configer"
//单例
class LogRegister {
    private manager: Worker | LogManager = null
    private useWorker = false //0 默认  1使用webworker
    static instance_ = null

    constructor(config: LogConfig) {
        if (config.useWorker) {
            if (!Worker) {
                console.error('your browser is not support webWorker , so we recomand normal scheme to call LogManager')
            } else {
                this.useWorker = true
            }
        }
        this.init(config)
    }
    // static getInstance(config: LogConfig) {
    //     if (this.instance_ === null) {
    //         this.instance_ = new LogRegister(config);
    //     }
    //     return this.instance_
    // }
    //配置项
    async init(config: LogConfig) {
        if (!this.useWorker) {
            log_configer.set(config)
            return new Promise((resolve) => {
                this.manager = LogManager.getInstance(() => {
                    resolve('ok')
                })
            })
        } else {
            const logWorker = Worker ? new Worker("webworker.js") : null
            this.manager = logWorker
            console.log('config----', JSON.stringify(config))
            this.manager.postMessage({ v: 'init', config: JSON.stringify(config) })
            return
        }
    }

    report(log: LogItem) {
        if (!!this.useWorker) {
            (this.manager as Worker).postMessage({ v: 'log', log })
        } else {
            (this.manager as LogManager).regist(log)
        }
    }
}

export default LogRegister