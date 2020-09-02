
import LogRegister from '../src/log_register'

import { Method, RET, LogItem } from '../src/interface'
import { timestampToDateTime, dateFormat2Day } from '../src/lib/utils'
import { DBLogItem } from '../src/log_db.js'
import LogQueue from '../src/log_queue'
import LogDB from '../src/log_db'
import OperateQueue from '../src/opration_queue'
import LogManager from '../src/log_manager'


const url = 'http://47.101.37.38:38080/app/mock/22/kxd/hera/user/add'

const logBatchNum = 100



const fakeDB = require('fake-indexeddb');
const fakeDBIndex = require('fake-indexeddb/lib/FDBIndex');
const fakeDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
const fakeDBDataBase = require('fake-indexeddb/lib/FDBDatabase');
const fakeObjectStore = require('fake-indexeddb/lib/FDBObjectStore');
const fakeDBTransaction = require('fake-indexeddb/lib/FDBTransaction');
const fakeIDBCursor = require('fake-indexeddb/lib/FDBCursor');
const fakeIDBRequest = require('fake-indexeddb/lib/FDBRequest');

function setDBInWindow(): void {
    // @ts-ignore
    window.indexedDB = fakeDB;
    // @ts-ignore
    window.IDBIndex = fakeDBIndex;
    // @ts-ignore
    window.IDBKeyRange = fakeDBKeyRange;
    // @ts-ignore
    window.IDBDatabase = fakeDBDataBase;
    // @ts-ignore
    window.IDBObjectStore = fakeObjectStore;
    // @ts-ignore
    window.IDBTransaction = fakeDBTransaction;
    // @ts-ignore
    window.IDBCursor = fakeIDBCursor;
    // @ts-ignore
    window.IDBRequest = fakeIDBRequest;
}
setDBInWindow();

function mockXHR(status: number, responseText: string, statusText: string): void {
    (window as any).XMLHttpRequest = class {
        status = 200;
        responseText = '';
        statusText = '';
        readyState = 4;
        open(): void { /* Noop */ }
        onreadystatechange(): void { /* Noop */ }
        setRequestHeader(): void { /* Noop */ }
        send(): void {
            setTimeout(() => {
                this.readyState = 4;
                this.status = status;
                this.responseText = responseText;
                this.statusText = statusText;
                this.onreadystatechange();
            }, 1000);
        }
    };
}

describe('logweb test', () => {
    // test('log_total_test', () => {
    //     startLog()

    // })
    test('log_queue test', async () => {
        const logQ = new LogQueue((log: LogItem) => {
            expect(log.type === 'test_log').toBe(true)
        })
        logQ.invokePushQueue({
            type: 'test_log',
            content: 'test_log_content'
        })
    })

    test('log_db test add && remove in Immediate_Log_Table', () => {
        const logDB = new LogDB('myDB', async () => {
            // 

            //加入一条日志
            const resData = await logDB.addLogItemsImmediate([{ type: 'test', content: 'test content', isImmediate: true }])
            const { ret, data } = resData



            // 

            //取出日志

            const logs = await logDB.getLogItemsImmediate(data.ids)
            // 

            //删除日志
            await logDB.incrementDeleteLogsInImmediateTable(data.ids)
            const deletedLogs = await logDB.getAllImediateLogs()
            // console.log('deletedLogs', deletedLogs)
            // expect(deletedLogs.length === 0).toBe(true)

            setTimeout(() => {
                expect(logDB.DBName === 'myDB').toBe(true)
                expect(ret === 1 && data.ids.length === 1).toBe(true)
                expect(logs.length === 1 && logs[0].type === 'test').toBe(true)
                expect(deletedLogs.length === 0).toBe(true)
            }, 1000)

        })
    })

    test('log_db test add && remove in Log_Table', async () => {
        const logDB = new LogDB('myDB', async () => {
            //加入一条日志
            const resData = await logDB.addLogItemsImmediate([{ type: 'test', content: 'test content', isImmediate: true }])
            const { ret, data } = resData

            //取出日志
            const logs = await logDB.getLogItemsImmediate(data.ids)

            //删除日志
            await logDB.incrementDeleteLogsInImmediateTable(data.ids)
            const deletedLogs = await logDB.getAllImediateLogs()

            setTimeout(async () => {
                expect(logDB.DBName === 'myDB').toBe(true)
                expect(ret === 1 && data.ids.length === 1).toBe(true)
                expect(logs.length === 1 && logs[0].type === 'test').toBe(true)
                expect(deletedLogs.length).toBe(true)
            }, 1000)
        })
    })


    test('test Operate_Queue', () => {
        const oQueue = new OperateQueue()
        oQueue.invokeInQueue(async () => {
            const data = await Promise.resolve('ok')
            expect(data === 'ok').toBe(true)
        })
    })
    test('test log_Manager', () => {

        const lr = new LogRegister({
            useWorker: false,
            url,
            method: Method.POST,
            headers: {
                'jzx-appid': "",
                'ACCESS_TOKEN': ""
            },
            repeat: 0,
            duration: 1000,
            // DBName: 'your app dbName  ,it is unique',
            // metaData,
            handleResponse: (responseData: string) => { // 返回{ok,data,error}
                const data = JSON.parse(responseData)
                return { ret: data.isOk ? RET.SUCCESS : RET.FAILED, error: data.errMsg }
            },
            handleRequest: (logs: DBLogItem[]) => {//相当于日志的封装
                return {
                    data: logs.reduce((arr, log) => {
                        arr.push({
                            ...log,
                        })
                        return arr
                    }, [])
                }
            }
        })
        const lm: LogManager = LogManager.getInstance()
        lr.report({
            type: `log_`,
            content: `content_`,
            isImmediate: true
        })
        setTimeout(() => {
            expect(lm.regist).toBeCalled
            expect(lm.reportDaily).toBeCalled
            expect(lm.getDB().addLogItems).toBeCalled
        })
    })
})

