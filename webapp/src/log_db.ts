
import InDB from 'indb'
import { dateFormat2Day } from './lib/utils'
import { LogItem, RET, NOOP, ResponseData } from './interface'
const DEFAULT_DB_NAME = "jzx_log_db" //数据库默认命名
const LOG_INFO_TABLE_NAME = "jzx_log_table"//记录日志内容
const LOG_INFO_IMMEDIATE_TABLE_NAME = 'jzx_log_immediate_table'//立即上传的日志列表
const LOG_DB_VERSION = 1 //版本号
const LOG_DAY_TABLE_NAME = 'jzx_log_day_table'//记录日志天信息
const LOG_DAY_TABLE_PRIMARY_KEY = 'logDay'
const LOG_DETAIL_REPORTNAME_INDEX = 'logReportName';
const LOG_DETAIL_CREATETIME_INDEX = 'logCreateTime';
const DEFAULT_LOG_DURATION = 7 * 24 * 3600 * 1000; //默认能存7天，超过7天，数据会被下一条记录删除

const LOG_DEALED_DAY_TABE_NAME = 'log_last_removed_day_table' //用来存放最后一次完成清除工作的日期
const LOG_DEALED_TABLE_KEY = 'last_removed_day'

type TimeStamp = number;
export interface DBLogDayItem {
    [LOG_DAY_TABLE_PRIMARY_KEY]: string;
}
export interface DBLogItem extends LogItem {
    [LOG_DETAIL_REPORTNAME_INDEX]: string;
    [LOG_DETAIL_CREATETIME_INDEX]: TimeStamp;
    id: number;
}
class LogDB {
    db: InDB = null;
    dbError: DOMException = null;
    tbLog: IDBTransaction = null;//table日志表格
    DBVersion: string
    DBName: string
    /**
     * 
     * @param dbCreateOk dbCreateOk:数据库连接及数据表获取或创建成功后callback
     * @param dbCreateError :数据库连接失败后的callback
     * @param DBName :数据库名称，默认DBNAME
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
                },
                {
                    name: LOG_DEALED_DAY_TABE_NAME,
                    autoIncrement: true,
                    keyPath: LOG_DEALED_TABLE_KEY,
                    indexs: [
                        {
                            name: LOG_DEALED_TABLE_KEY,
                            unique: true,
                            keyPath: LOG_DEALED_TABLE_KEY
                        }
                    ]
                }
            ]
        })
        idb.connect().then(e => {
            // console.log('数据库连接成功' + idb + '--------- ', e)
            this.db = idb
            ready && ready()
        })
    }

    judgeDBIsConnected(): ResponseData {
        if (this.db === null) {
            console.error('db is not avalable')
            return { ret: RET.FAILED }
        }
    }

    /**
     * @description 添加一条日志记录
     * @param logItem 
     * @param immediate 是否要求立即上报,true存到立即上传的日志表 jzx_log_immediate_table ，否则存默认日志表jzx_log_table
     */
    async addLogItem(logItem: LogItem): Promise<ResponseData> {
        this.judgeDBIsConnected()
        // console.log('存储日志', logItem)
        const today = dateFormat2Day(new Date())

        const store1 = this.db.use(LOG_INFO_TABLE_NAME)
        if (logItem.isImmediate === true) {
            return this.addLogItemImmediate(logItem)
        }

        const store2 = this.db.use(LOG_DAY_TABLE_NAME)

        const id = await store1.add({
            [LOG_DETAIL_REPORTNAME_INDEX]: today,
            [LOG_DETAIL_CREATETIME_INDEX]: Date.now(),
            ...logItem
        })

        store2 && store2.put({
            [LOG_DAY_TABLE_PRIMARY_KEY]: today
        })
        return { ret: RET.SUCCESS, data: { id } }
    }

    /**
    * @description 添加多条日志记录
    * @param logItem 
    * @param immediate 是否要求立即上报,true存到立即上传的日志表 jzx_log_immediate_table ，否则存默认日志表jzx_log_table
    */
    async addLogItems(logItems: Array<LogItem>) {
        console.log('addLogItems存储多条日志', logItems)
        this.judgeDBIsConnected()
        const today = dateFormat2Day(new Date())
        const store1 = this.db.use(LOG_INFO_TABLE_NAME)
        const store2 = this.db.use(LOG_DAY_TABLE_NAME)


        const batches = logItems.map(logItem => {
            return objectStore => objectStore.add({
                [LOG_DETAIL_REPORTNAME_INDEX]: today,
                [LOG_DETAIL_CREATETIME_INDEX]: Date.now(),
                ...logItem
            })
        })
        const ids: Array<number> = await store1.batch(batches)
        store2 && store2.put({
            [LOG_DAY_TABLE_PRIMARY_KEY]: today
        })

        return { ret: RET.SUCCESS, data: { ids } }
    }



    /**
     * @description 获取 某一天 或者 某些天 的所有的日志数据
     * @param reportName 日期 例：2020-06-16 或者  日期集合['2020-06-16','2020-06-17']
     */
    async getLogsByReportName(reportName: string | Array<string>): Promise<Array<DBLogItem>> {
        this.judgeDBIsConnected()
        const store = this.db.use(LOG_INFO_TABLE_NAME)
        if (reportName.constructor.name === 'String') {
            const logs = (await store.query(LOG_DETAIL_REPORTNAME_INDEX, reportName))
            return logs;
        } else if (reportName.constructor.name === 'Array') {
            const selectItems: Array<object> = (<Array<string>>reportName).map(rpName => {
                return { key: LOG_DETAIL_REPORTNAME_INDEX, value: rpName, optional: true }
            })
            const logs = await store.select(selectItems)
            return logs
        }
    }
    //读取jzx_log_day_table表中所有日期集合
    async getAllLogDays(): Promise<DBLogDayItem[]> {
        this.judgeDBIsConnected()
        const store = this.db.use(LOG_DAY_TABLE_NAME)
        return (((await store.all()) as any[]) as DBLogDayItem[]) || []
    }

    /**
     * @description 删除指定日期（集合或单个）的日志表jzx_log_table中信息 以及日志jzx_log_day_table天信息
     * @param logDay :可以单个日期，或者日期集合
     */
    async incrementalDeleteByDay(logDay: string | Array<string>): Promise<void> {
        this.judgeDBIsConnected()
        // console.log('incrementalDeleteByDay')
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
    async incrementalDeleteLogs(logs: Array<DBLogItem>, days: Array<DBLogDayItem>): Promise<ResponseData> {
        this.judgeDBIsConnected()
        // console.log('正在删除删除的logs', logs)
        const store1 = this.db.use(LOG_INFO_TABLE_NAME)
        const store2 = this.db.use(LOG_DAY_TABLE_NAME)

        if (logs && logs.length > 0) {
            const batches = logs.map(obj => {
                return objectStore => objectStore.delete(obj.id)
            })
            await store1.batch(batches)
        }
        // console.log('待删除days', days)

        if (days && days.length > 0) {
            const batches = days.map(day => {
                return objectStore => objectStore.delete(day[LOG_DAY_TABLE_PRIMARY_KEY])
            })
            await store2.batch(batches)
        }
        return { ret: RET.SUCCESS }
    }

    /***记录或更新，最后一次删除时间 */
    async updateDayRemovedInfo(date: string): Promise<void> {
        const store = this.db.use(LOG_DEALED_DAY_TABE_NAME)
        const record = await store.last()
        if (record) {
            record[LOG_DEALED_TABLE_KEY] = date
            return await store.put(record)
        }
        else return await store.put({ [LOG_DEALED_TABLE_KEY]: date })
    }
    /**
     * 获取最后一次每日删除操作的日信息，格式：2020-06-16
     */
    async getDayRemovedDayInfo() {
        const store = this.db.use(LOG_DEALED_DAY_TABE_NAME)
        const record = await store.last()
        if (record) {
            return record[LOG_DEALED_TABLE_KEY]
        }
        return null
    }
    /*************************对Immediate_Table操作*********************************************/

    //立即上传Table  添加日志项
    async addLogItemImmediate(logItem: LogItem) {
        // console.log('addLogItemImmediate, logItem is :', logItem)
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        const today = dateFormat2Day(new Date())
        const logId = await store1.add({
            [LOG_DETAIL_REPORTNAME_INDEX]: today,
            [LOG_DETAIL_CREATETIME_INDEX]: Date.now(),
            ...logItem
        })
        return logId
    }
    //立即存储多条立即上传日志记录 
    async addLogItemsImmediate(logItems: Array<LogItem>): Promise<ResponseData> {
        // console.log('addLogItemsImmediate, logItem is :', logItems)
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        const today = dateFormat2Day(new Date())

        const batchs = logItems.map(logItem => {
            return objectStore => objectStore.add({
                [LOG_DETAIL_REPORTNAME_INDEX]: today,
                [LOG_DETAIL_CREATETIME_INDEX]: Date.now(),
                ...logItem
            })
        })

        const ids = await store1.batch(batchs)
        return { ret: ids ? RET.SUCCESS : RET.FAILED, data: { ids } }
    }

    //立即上传数据库中取出logItem
    async getLogItemImmediate(logId) {
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        return await store1.get(logId)
    }
    //根据ids获取立即上传的日志
    async getLogItemsImmediate(logIds: Array<number>): Promise<Array<DBLogItem>> {
        const batch = logIds.map(id => {
            return objectStore => objectStore.get(id)
        })
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)

        return await store1.batch(batch)
    }

    /**立即上传日志表的 jzx_log_immediate_table log删除*/
    async incrementDeleteLogInImmediateTable(logId: number) {
        this.judgeDBIsConnected()
        // console.log('正在删除ImmediateTable的log', logId)
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        const res = await store1.delete(logId)
        return res
    }

    async incrementDeleteLogsInImmediateTable(logIds: Array<number>): Promise<ResponseData> {
        this.judgeDBIsConnected()
        // console.log('正在删除ImmediateTable的log', logIds)
        const batches = logIds.map(id => {
            return objectStore => objectStore.delete(id)
        })
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        await store1.batch(batches)
        return { ret: RET.SUCCESS }
    }

    /*获取所有immediate Log*/
    async getAllImediateLogs(): Promise<Array<DBLogItem>> {
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        const logs = await store1.all()
        return logs
    }
    /**删除log*/
    async deleteImediateLog(logs: Array<DBLogItem>) {
        const store1 = this.db.use(LOG_INFO_IMMEDIATE_TABLE_NAME)
        if (logs && logs.length > 0) {
            const batches = logs.map(obj => {
                return objectStore => objectStore.delete(obj.id)
            })
            return await store1.batch(batches)
        }
    }
    getLogIdsBylogs(logs) {
        return logs.map(item => {
            return item.id
        })
    }
}

export default LogDB


