
import LogDB from "./log_db"
import OperationQueue from "./opration_queue"
import { dateFormat2Day } from './lib/utils'
import LogReporter from './log_reporter'
import { LogConfig, LogItem, NOOP } from "./interface"

class LogManager {
    static instance_ = null
    private logDB: LogDB = null
    private operationQueue: OperationQueue
    private logConfig: LogConfig = null
    private logReporter: LogReporter = null

    private today: string = null
    private dailyRemoved: boolean = false//每日一次的大清除是否完成，默认未完成
    // private storeToday$$_ = {
    //     get: () => {
    //         return localStorage.getItem("$$logDate")
    //     },
    //     set: (day: string) => {
    //         localStorage.setItem("$$logDate", day)
    //     }
    // }

    constructor(config: LogConfig, DBReady?: Function) {
        console.log('-------config-----------', config)
        this.logConfig = config
        this.logReporter = new LogReporter(config)
        this.today = dateFormat2Day(new Date())
        // let logDate = this.storeToday$$_.get()
        // if (logDate === this.today) {//已经清楚过
        //     console.log('今日已经清除过一波数据了')
        //     this.dailyRemoved = true
        // }
        this.logDB = new LogDB(null, () => {
            console.info('---------DB is prepared-----------')
            //每次登陆后先进行清理
            DBReady && DBReady()
            if (!this.dailyRemoved) {
                this.reportDaily()
            }
        })
        this.operationQueue = new OperationQueue() //所有log存取、删除操作相关的任务,都push到这个Queue中执行
    }
    static getInstance(config: LogConfig, DBReady?: Function) {
        if (this.instance_ === null) {
            this.instance_ = new LogManager(config, DBReady);
        }
        return this.instance_
    }

    //日志主动调用次方法 若logDB未初始化好，100ms后准备重试一次
    async regist(params: LogItem) {
        if (!this.logDB.db) {
            console.error('----regist  logdb is unprepared-----')
            return Promise.resolve(setTimeout(() => this.operationQueue.invokeInQueue(() => this.logDB.addLogItem(params)), 100))
        } else {
            return await this.operationQueue.invokeInQueue(() => this.logDB.addLogItem(params))
        }
    }

    //每日一次的上传计划，实例化后最先完成的事
    async reportDaily() {
        await this.operationQueue.invokeInQueue(() => this.reportDaily_())
    }

    async reportDaily_() {
        console.log('start Daily Report LOGs')
        const days = await this.logDB.getAllLogDays() || []
        const logs = await this.logDB.getLogsByReportName(days.map(day => { return day.logDay })) || []
        if (logs.length === 0) return
        const data = await this.logReporter.report({ data: logs })
        console.log('reportDaily callback data', data)
        if (data.ret === 1) {
            await this.logDB.incrementalDeleteLogs(logs, days) //删除当日清除的日志信息和日志日期信息
            this.dailyRemoved = true
            // this.storeToday$$_.set(this.today)
            console.info('Daily Report LOGs  has  success')
        } else {
            console.error('Daily Report LOGs  has  failed')
        }
    }
}

export default LogManager
