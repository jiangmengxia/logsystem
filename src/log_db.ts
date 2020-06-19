
// import { idbIsSupported, CustomDB } from 'idb-managed';
import InDB from 'indb'
import { dateFormat2Day } from './lib/utils'
import { LogItem, RET } from './interface'
const DEFAULT_DB_NAME = "jzx_log_db" //数据库默认命名
const LOG_INFO_TABLE_NAME = "jzx_log_table"//记录日志内容
const LOG_INFO_IMMEDIATE_TABLE_NAME = 'jzx_log_immediate_table'//立即上传的日志列表
const LOG_DB_VERSION = 1 //版本号
const LOG_DAY_TABLE_NAME = 'jzx_log_day_table'//记录日志天信息
const LOG_DAY_TABLE_PRIMARY_KEY = 'logDay'
const LOG_DETAIL_REPORTNAME_INDEX = 'logReportName';
const LOG_DETAIL_CREATETIME_INDEX = 'logCreateTime';
const DEFAULT_LOG_DURATION = 7 * 24 * 3600 * 1000; //默认能存7天，超过7天，数据会被下一条记录删除
const NOOP = function (): void { /* Noop */ };

type TimeStamp = number;
export interface DBLogDayItem {
    [LOG_DAY_TABLE_PRIMARY_KEY]: string;
    totalSize: number;
    // reportPagesInfo: {
    //     pageSizes: number[]; // Array of pageSize of each page.
    // };
}
interface DBLogItem {
    [LOG_DETAIL_REPORTNAME_INDEX]: string;
    [LOG_DETAIL_CREATETIME_INDEX]: TimeStamp;
    id: number;
}
class LogDB {
    db: InDB = null;
    dbError: DOMException = null;
    tbLog: IDBTransaction = null;//table日志表格
    TBLogName: string
    DBVersion: string
    DBName: string
    /**
     * 
     * @param dbCreateOk dbCreateOk:数据库连接及数据表获取或创建成功后callback
     * @param dbCreateError :数据库连接失败后的callback
     * @param DBName :数据库名称，默认DBNAME
     * @param TBLogName :日志表名称，默认TBLOGNAME
     */
    constructor(DBName: string = DEFAULT_DB_NAME, ready: Function = NOOP) {
        const idb = new InDB({
            name: DBName || DEFAULT_DB_NAME,
            version: LOG_DB_VERSION,
            itemDuration: DEFAULT_LOG_DURATION,
            stores: [
                {
                    name: LOG_INFO_IMMEDIATE_TABLE_NAME,
                    keyPath: 'id',
                    autoIncrement: true,
                    indexes: [
                        {
                            name: LOG_DETAIL_REPORTNAME_INDEX,
                            unique: false,
                            keyPath: LOG_DETAIL_REPORTNAME_INDEX
                        },
                        {
                            name: LOG_DETAIL_CREATETIME_INDEX,
                            unique: false,
                            keyPath: LOG_DETAIL_CREATETIME_INDEX
                        }
                    ]
                },
                {
                    name: LOG_INFO_TABLE_NAME,
                    keyPath: 'id',
                    autoIncrement: true,
                    indexes: [
                        {
                            name: LOG_DETAIL_REPORTNAME_INDEX,
                            unique: false,
                            keyPath: LOG_DETAIL_REPORTNAME_INDEX
                        },
                        {
                            name: LOG_DETAIL_CREATETIME_INDEX,
                            unique: false,
                            keyPath: LOG_DETAIL_CREATETIME_INDEX
                        }
                    ]
                },
                {
                    name: LOG_DAY_TABLE_NAME,
                    autoIncrement: true,
                    // isKv: true,
                    keyPath: LOG_DAY_TABLE_PRIMARY_KEY,
                    indexs: [
                        {
                            name: LOG_DAY_TABLE_PRIMARY_KEY,
                            unique: true,
                            keyPath: LOG_DAY_TABLE_PRIMARY_KEY
                        }
                    ]
                }
            ]
        })
        idb.connect().then(e => {
            console.log('数据库连接成功' + idb + '--------- ', e)
            this.db = idb
            ready && ready()
        })
    }


    /**
     * @description 添加一条日志记录
     * @param logItem 
     * @param immediate 是否要求立即上报,true存到立即上传的日志表 jzx_log_immediate_table ，否则存默认日志表jzx_log_table
     */
    async addLogItem(logItem: LogItem, immediate: Boolean = false) {
        if (this.db === null) {
            console.log('db is not avalable')
            return { ret: RET.FAILED }
        }
        console.log('存储日志', logItem)
        const today = dateFormat2Day(new Date())

        let store1 = this.db.use(LOG_INFO_TABLE_NAME)
        if (immediate === true) {
            store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        }

        const store2 = this.db.use(LOG_DAY_TABLE_NAME)

        await store1.add({
            [LOG_DETAIL_REPORTNAME_INDEX]: today,
            [LOG_DETAIL_CREATETIME_INDEX]: Date.now(),
            ...logItem
        })

        store2 && store2.put({
            [LOG_DAY_TABLE_PRIMARY_KEY]: today
        })
        return { ret: RET.SUCCESS }
    }

    /**
     * @description 获取 某一天 或者 某些天 的所有的日志数据
     * @param reportName 日期 例：2020-06-16 或者  日期集合['2020-06-16','2020-06-17']
     */
    async getLogsByReportName(reportName: string | Array<string>) {
        if (this.db === null) {
            console.log('db is not avalable')
            return
        }
        const store = this.db.use(LOG_INFO_TABLE_NAME)
        if (reportName.constructor.name === 'String') {
            const logs = (await store.query(LOG_DETAIL_REPORTNAME_INDEX, reportName))
            // console.log('logs', logs)
            return logs;
        } else if (reportName.constructor.name === 'Array') {
            const selectItems: Array<Object> = (<Array<string>>reportName).map(rpName => {
                return { key: LOG_DETAIL_REPORTNAME_INDEX, value: rpName, optional: true }
            })
            let logs = await store.select(selectItems)
            // console.log('logs', logs)
            return logs
        }
    }
    //读取jzx_log_day_table表中所有日期集合
    async getAllLogDays(): Promise<DBLogDayItem[]> {
        if (this.db === null) {
            console.log('db is not avalable')
            return
        }
        const store = this.db.use(LOG_DAY_TABLE_NAME)
        return (((await store.all()) as any[]) as DBLogDayItem[]) || []
    }

    //获取jzx_log_day_table连续几天的日志日期集合
    // async getLogByDays(fromLogDay: string,
    //     toLogDay: string) {
    //     if (this.db === null) {
    //         console.log('db is not avalable')
    //         return
    //     }
    //     const store = this.db.use(LOG_DAY_TABLE_NAME)
    //     console.log('getLogByDays', store)
    //     if (this.db === null) {
    //         console.log('db is not avalable')
    //         return
    //     }
    //     if (fromLogDay === toLogDay) {
    //         const result = await store.get(fromLogDay)
    //         // console.log('---', result)
    //         return result ? [result] : [];
    //     } else {
    //         // console.log('fromLogDay', fromLogDay, 'toLogDay', toLogDay)
    //         const result = (await store.select([
    //             { key: LOG_DAY_TABLE_PRIMARY_KEY, value: fromLogDay, optional: true, compare: ">=" },
    //             { key: LOG_DAY_TABLE_PRIMARY_KEY, value: toLogDay, optional: true, compare: "<=" }
    //         ]))
    //         // console.log('result is', result)
    //         return result
    //     }
    // }
    /**
     * @description 删除指定日期（集合或单个）的日志表jzx_log_table中信息 以及日志jzx_log_day_table天信息
     * @param logDay :可以单个日期，或者日期集合
     */
    async incrementalDeleteByDay(logDay: string | Array<string>) {
        if (this.db === null) {
            console.log('db is not avalable')
            return
        }
        console.log('incrementalDeleteByDay')
        const store1 = this.db.use(LOG_INFO_TABLE_NAME)
        const store2 = this.db.use(LOG_DAY_TABLE_NAME)

        const objs = await this.getLogsByReportName(logDay)

        if (objs) {
            const batches = objs.map(obj => {
                return objectStore => objectStore.delete(obj.id)
            })
            await store1.batch(batches)
        }
        await store2.delete(logDay)
    }

    /**
     * 删除日志集合中的日志，根据日志id进行删除
     * 删除当日清除的日志信息和日志日期信息
     */
    async incrementalDeleteLogs(logs: Array<DBLogItem>, days: Array<DBLogDayItem>) {
        if (this.db === null) {
            console.log('db is not avalable')
            return
        }
        console.log('正在删除删除的logs', logs)
        const store1 = this.db.use(LOG_INFO_TABLE_NAME)
        const store2 = this.db.use(LOG_DAY_TABLE_NAME)

        if (logs && logs.length > 0) {
            const batches = logs.map(obj => {
                return objectStore => objectStore.delete(obj.id)
            })
            await store1.batch(batches)
        }
        console.log('待删除days', days)

        if (days && days.length > 0) {
            const batches = days.map(day => {
                return objectStore => objectStore.delete(day[LOG_DAY_TABLE_PRIMARY_KEY])
            })
            await store2.batch(batches)
        }

    }
}

export default LogDB


