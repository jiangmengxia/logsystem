
/**
 * @description 小程序本地存储制作本地类数据库系统。实现DataBase,Table功能
 * 多使用异步的方式进存储，提高任务的执行效率
 * 隔离策略：
 * 小程序有隔离策略，同一个微信用户，同一个小程序 storage 上限为 10MB。storage 以用户维度隔离，同一台设备上，A 用户无法读取到 B 用户的数据；不同小程序之间也无法互相读写数据。
 * 10MB=5242880个汉字  设每条记录100个汉字， 预计允许存5000条日志记录 （7天内有效，7天外失效，直接清除）
 * 
 * setStorage
 * 单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB
 */

import { Table } from "./tb"
import { StoreItem, InDBConfig } from "./interface"
const SYSKEY = `%dbsys_dbs%`

//整个数据库系统
export class InDB {
    private DBSysData: string = null //所有数据库集合 {dbName:DataBase}
    private DBName: string = null
    private Stores: Array<StoreItem> = null
    private DB = {}  //所有表集合
    constructor(props: InDBConfig) {
        if (wx === null) {
            console.error('当前版本不支持微信，请切换到微信后再使用')
            return null
        }
        const { name, stores } = props
        this.DBName = name
        this.Stores = stores
    }

    async connect() {
        //同步
        return new Promise((resolve, reject) => {
            try {
                this.initDB(this.Stores)
                resolve(this)
            } catch (e) {
                console.error(e)
            }
        })
    }

    // 初始化
    initDB(stores: Array<StoreItem>) {
        for (let i = 0; i < stores.length; i++) {
            this.createTable(stores[i])
        }
    }
    /**
     * @description 创建表格
     * @param DBName 
     * @param TBName 
     */
    private createTable(storeItem: StoreItem): Table {
        const { name } = storeItem
        if (this.DB[name] !== null && this.DB[name] instanceof Table) {
            return
        } else {
            this.DB[name] = new Table(storeItem, this.DBName, SYSKEY)
        }
    }
    /**
     *  @description 使用某个表
     *  @param name  表名称
     */
    use(name: string): Table {
        if (this.DB[name] !== null && this.DB[name] instanceof Table) {
            return this.DB[name]
        } else {
            console.error(`未找到对应的表`)
            return
        }
    }
}




