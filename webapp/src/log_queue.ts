import { LogItem } from "./interface";

/**
 * 由于indexDB链接数据库需要时间，在此期间可能已经过来了，这时直接去调用数据库操作，数据库未准备就绪，会报错
 * 
 */
class LogQueue {
    private queue: LogItem[];
    private operationRunning = false //队列是否是激活状态
    private runStart = false //表示是否可以开始轮询，只有runStart=true 才可以开始

    private logOperate: Function
    constructor(logOperate: Function) {
        this.queue = []
        this.logOperate = logOperate
    }
    /**
     * 开始循环取队列
     */
    startOperate() {
        this.runStart = true
        this.operatingRecursion()
    }

    /**
     * @description 取操作循环，从队列中取出全部LogItem,
     */
    operatingRecursion() {
        if (!this.runStart) return
        if (!this.operationRunning && this.queue.length > 0) {
            this.operationRunning = true
            if (this.queue.length > 0) {
                let logItems: Array<LogItem>
                logItems = this.queue.splice(0, 1)
                this.logOperate && this.logOperate(logItems)
                this.operationRunning = false
                this.operatingRecursion()
            }
        }
    }

    /**
     * 把数据存入queue，并触发事件循环
     */

    invokePushQueue(log: LogItem) {
        this.queue.push(log)
        this.operatingRecursion()
    }

}



export default LogQueue