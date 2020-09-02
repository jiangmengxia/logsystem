
import LogDB, { DBLogDayItem, DBLogItem } from "./log_db"
import OperationQueue from "./opration_queue"
import { dateFormat2Day } from './lib/utils'
import LogReporter from './log_reporter'
import { LogConfig, LogItem, NOOP, RET } from "./interface"
import log_configer from "./log_configer"
import LogQueue from "./log_queue"
const MAX_REPORT_NUM = 50

class LogManager {
    static instance_ = null
    private logDB: LogDB = null
    private operationQueue: OperationQueue
    // private logConfig: LogConfig = null
    private logReporter: LogReporter = null
    private logQueue: LogQueue = null

    private today: string = null
    private dailyRemoved = false//每日一次的大清除是否完成，默认未完成

    constructor(DBReady?: () => void) {
        this.logReporter = new LogReporter()
        //所有log存取、删除操作相关的任务,都push到这个Queue中执行
        this.operationQueue = new OperationQueue()
        this.logQueue = new LogQueue((logItems: Array<LogItem>) => { //从队列中取出一条日志后，对日志的操作
            this.operationQueue.invokeInQueue(() => {
                const { ImLogs, logs } = logItems.reduce((obj, logItem) => {
                    if (logItem.isImmediate === true) {
                        obj.ImLogs.push(logItem)
                    } else {
                        obj.logs.push(logItem)
                    }
                    return obj
                }, { ImLogs: [], logs: [] })
                if (ImLogs.length > 0) {
                    this.reportImmediately(ImLogs)
                }
                if (logs.length > 0) {
                    this.logDB.addLogItems(logs).then(({ ret, data }) => {
                        if (ret === 1) {
                        }  //存储成功
                    })
                }
            })
        }, (log_configer.get('isOnebyone')) as boolean)
        this.today = dateFormat2Day(new Date())
        this.init(DBReady)
    }
    getDB() {
        return this.logDB
    }

    async init(DBReady: () => void) {
        this.logDB = new LogDB(log_configer.get('DBName'), async () => {
            //每次登陆后先进行清理
            DBReady && DBReady()
            await this.reportImmediateLogsUnReported()//将之前未及时上传的日志信息（立即上传表中日志）上传
            if (!this.dailyRemoved) {
                this.reportDaily().then(() => {
                    // console.log('--today第一次清除---今日完成清除---')
                    this.logQueue.startOperate()
                })
            } else {
                this.logQueue.startOperate()
            }
        })
    }

    static getInstance(DBReady?: () => void) {
        if (this.instance_ === null) {
            this.instance_ = new LogManager(DBReady);
        }
        return this.instance_
    }

    async regist(log: LogItem) {
        return this.logQueue.invokePushQueue(log)
    }
    /**
     * @description 未及时上报的imdiate_table的logs上报
     */
    async reportImmediateLogsUnReported() {
        let logs: Array<DBLogItem> = await this.logDB.getAllImediateLogs()
        if (logs.length > 0) {
            if (logs.length > MAX_REPORT_NUM) {//每次最多上传最早的50条，否则会影响前端主业务运行
                logs = logs.splice(0, MAX_REPORT_NUM)
            }
            this.reportLogs(logs, async (res) => {
                const removedLogs = []
                for (let i = 0; i < res.length; i++) {
                    if (res[i].ret === RET.SUCCESS) {
                        removedLogs.push(logs[i])
                    }
                }
                if (removedLogs.length === 0) return
                let ids = this.logDB.getLogIdsBylogs(removedLogs)
                await this.logDB.incrementDeleteLogsInImmediateTable(ids)
            })
        } else {
            return
        }
    }

    //每日一次的上传计划，实例化后最先完成的事
    async reportDaily(): Promise<void> {
        return await this.operationQueue.invokeInQueue(() => this.reportDaily_())
    }

    async reportDaily_() {
        const days = await this.logDB.getAllLogDays() || []
        let logs: Array<DBLogItem> = await this.logDB.getLogsByReportName(days.map(day => { return day.logDay })) || []
        if (logs.length > MAX_REPORT_NUM) {//每次最多上传最早的50条，否则会影响前端主业务运行
            logs = logs.splice(0, MAX_REPORT_NUM)
        }
        return this.reportLogs(logs, async (res) => {
            let removedLogs = []
            for (let i = 0; i < res.length; i++) {
                if (res[i].ret === RET.SUCCESS) {
                    removedLogs.push(logs[i])
                }
            }
            if (removedLogs.length === 0) {
                console.info('Daily Report LOGs  has  failed')
                return
            }
            await this.logDB.incrementalDeleteLogs(logs, days) //删除当日清除的日志信息和日志日期信息
            this.dailyRemoved = true
            this.logDB.updateDayRemovedInfo(this.today)
            console.info('Daily Report LOGs', logs, '  has  success')
        })
    }
    /**
     * @description 日志上报请求
     * @param logs 待上传的日志
     * @param callback 
     */
    async reportLogs(logs: Array<DBLogItem>, callback: Function) {
        if (logs.length === 0) return
        //仅支持单条上传

        const optArr = []

        for (let i = 0; i < logs.length; i++) {
            optArr.push(new Promise((resolve) => {
                this.logReporter.report({ data: logs[i] }).then(res => {
                    resolve(res)
                })
            }))
        }
        return Promise.all(optArr).then((resArr) => {
            callback && callback(resArr)
        })
    }
    /**
     * @description 上报日志记录,立即上传的记录
     * @param logItems
     */
    async reportImmediately(logItems: Array<LogItem>) {
        if (logItems.length === 0) return
        this.logDB.addLogItemsImmediate(logItems).then(async ({ ret, data }) => {
            if (ret === RET.SUCCESS) {
                let dbLogs: Array<DBLogItem> = await this.logDB.getLogItemsImmediate(data.ids)
                if (dbLogs.length > MAX_REPORT_NUM) {//每次最多上传最早的50条，否则会影响前端主业务运行
                    dbLogs = dbLogs.splice(0, MAX_REPORT_NUM)
                }
                this.reportLogs(dbLogs, async (res) => {
                    let removedIds = []
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].ret === RET.SUCCESS) {
                            removedIds.push(data.ids[i])
                        }
                    }
                    if (removedIds.length === 0) return
                    await this.logDB.incrementDeleteLogsInImmediateTable(removedIds)
                })
            }
        })
    }
    //上传错误信息
    errorHandler() {

    }
}

export default LogManager
