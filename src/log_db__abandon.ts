
import { idbIsSupported, CustomDB } from 'idb-managed';
import { dateFormat2Day } from './lib/utils'
import { LogItem } from './interface';
const DEFAULT_DB_NAME = "jzx_log_db" //数据库默认命名
const LOG_INFO_TABLE_NAME = "jzx_log_table"//记录日志内容
const LOG_IMMEDIATELY_INFO_TABLE_NAME = "jzx_immediatly_log_table"//记录日志内容,要求立即上传的日志
const LOG_DB_VERSION = 1 //版本号
const LOG_DAY_TABLE_NAME = 'jzx_log_day_table'//记录日志天信息
const LOG_DAY_TABLE_PRIMARY_KEY = 'logDay'
const LOG_DETAIL_REPORTNAME_INDEX = 'logReportName';
const LOG_DETAIL_CREATETIME_INDEX = 'logCreateTime';
const DEFAULT_LOG_DURATION = 7 * 24 * 3600 * 1000; //默认能存7天，超过7天，数据会被下一条记录删除


type TimeStamp = number;
export interface LoganLogDayItem {
    [LOG_DAY_TABLE_PRIMARY_KEY]: string;
    totalSize: number;
    // reportPagesInfo: {
    //     pageSizes: number[]; // Array of pageSize of each page.
    // };
}
interface LoganLogItem {
    [LOG_DETAIL_REPORTNAME_INDEX]: string;
    [LOG_DETAIL_CREATETIME_INDEX]: TimeStamp;
    logSize: number;
    logString: string;
}
class LogDB {
    // db: CustomDB = null;
    public static idbIsSupported = idbIsSupported
    db: CustomDB = null;
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
    constructor(DBName: string = DEFAULT_DB_NAME) {
        // if (!idbIsSupported()) {
        //     console.error('your browser doesn\'t support a stable version of IndexedDB . Such and such feature will not be available.')
        // } else {
        this.db = new CustomDB({
            dbName: DBName,
            dbVersion: LOG_DB_VERSION,
            itemDuration: DEFAULT_LOG_DURATION,
            tables: {
                [LOG_INFO_TABLE_NAME]: {
                    indexList: [
                        {
                            indexName: LOG_DETAIL_REPORTNAME_INDEX,
                            unique: false
                        },
                        {
                            indexName: LOG_DETAIL_CREATETIME_INDEX,
                            unique: false
                        }
                    ]
                },
                //立即上传的表格
                [LOG_IMMEDIATELY_INFO_TABLE_NAME]: {
                    indexList: [
                        {
                            indexName: LOG_DETAIL_REPORTNAME_INDEX,
                            unique: false
                        },
                        {
                            indexName: LOG_DETAIL_CREATETIME_INDEX,
                            unique: false
                        }
                    ]
                },
                [LOG_DAY_TABLE_NAME]: {
                    primaryKey: LOG_DAY_TABLE_PRIMARY_KEY
                }
            }
        });

        // }
    }

    //添加一条日志记录
    async addLogItem(logItem: LogItem) {
        if (this.db === null) {
            console.log('db is not avalable')
            return
        }
        const today = dateFormat2Day(new Date())
        let s = await this.db.addItems([
            {
                tableName: LOG_INFO_TABLE_NAME,
                item: {
                    ...logItem,
                    [LOG_DETAIL_REPORTNAME_INDEX]: today,
                    itemDuration: 1000 * 3600,
                    [LOG_DETAIL_CREATETIME_INDEX]: Date.now()
                }
            },
            {
                tableName: LOG_DAY_TABLE_NAME,
                item: {
                    logDay: today
                }
            }
        ])
    }
    //连续几天的日志数据 ReportName===日信息
    async getLogsByReportName(reportName: string) {
        const logs = ((await this.db.getItemsInRange({
            tableName: LOG_INFO_TABLE_NAME,
            indexRange: {
                indexName: LOG_DETAIL_REPORTNAME_INDEX,
                onlyIndex: reportName
            }
        })) as any[]) as LoganLogItem[];
        console.log('logs', logs)
        return logs;
    }
    //获取联系几天的日志日信息
    async getLogByDays(fromLogDay: string,
        toLogDay: string) {
        if (fromLogDay === toLogDay) {
            const result = ((await this.db.getItem(
                LOG_DAY_TABLE_NAME,
                fromLogDay
            )) as any) as LoganLogDayItem | null;
            console.log('--result is--', result)
            return result ? [result] : [];
        } else {
            const result = ((await this.db.getItemsInRange({
                tableName: LOG_DAY_TABLE_NAME,
                indexRange: {
                    indexName: LOG_DAY_TABLE_PRIMARY_KEY,
                    lowerIndex: fromLogDay,
                    upperIndex: toLogDay,
                    lowerExclusive: false,
                    upperExclusive: false
                }
            })) as any) as LoganLogDayItem | []
            console.log('result is', result)
            return result
        }
    }
    //删除某天的记录
    async incrementalDeleteByDay(logDay: string) {
        await this.db.deleteItemsInRange([
            {
                tableName: LOG_INFO_TABLE_NAME,
                indexRange: {
                    indexName: LOG_DETAIL_REPORTNAME_INDEX,
                    onlyIndex: logDay
                }
            }
        ]);
    }
    //清空立即上传table--【LOG_IMMEDIATELY_INFO_TABLE_NAME】的所有日志数据
    //该列表的数据会一次性上传，一般数据不会很多
    async incrementalDeleteImmediatelyLogByDay() {
        await this.db.deleteItemsInRange([
            {
                tableName: LOG_INFO_TABLE_NAME
            }
        ]);
    }
}

export default LogDB


