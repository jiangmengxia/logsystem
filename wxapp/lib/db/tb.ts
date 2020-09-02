/**
 * Table/Store的定义和操作
 */

import { StoreItem, StoreItemIndex, StoreRowItem, StoreUpdateItem, IndexId, QueryData } from "./interface"
const MAXLEN = 10 * 1024 * 1024 / 2

export class Table {
    private name: string = null
    private keyPath: string = null  //主键
    private autoIncrement: boolean = true
    private keyPaths: {} = {} //存放所有表头的key值
    private indexes: Array<StoreItemIndex> = []
    private rows: Array<Object> = [] //表的rows
    private [IndexId]: number = 0 //记录id，按序递增
    private DB_NAME = ''
    private SYS_KEY = ''

    constructor(storeItem: StoreItem, dbname: string, sysKey: string,) {
        const { name, keyPath, autoIncrement, indexes } = storeItem
        if (typeof name != 'string') {
            console.error('table name should be string')
            return
        }
        this.name = name
        this.DB_NAME = dbname
        this.SYS_KEY = sysKey
        this.indexes = indexes || []
        if (keyPath === null) {
            console.error(`每个表格必须设置一个keyPath`)
        }
        this.keyPath = keyPath
        this.autoIncrement = autoIncrement

        for (let i = 0; i < indexes.length; i++) { //indexes中有重复项，后者覆盖前者
            this.keyPaths[indexes[i].keyPath] = indexes[i]
        }
        if (this.keyPaths[keyPath] === undefined) {
            console.error(`indexes缺少keyPath项`)
        }

        this.initTableDate()
    }
    initTableDate() {
        const { name, keyPath, autoIncrement, rows = [], indexes } = this
        const data: StoreUpdateItem = {
            type: `_TABLE_`,
            name,
            keyPath,
            autoIncrement,
            indexes,
            rows,
            [IndexId]: this[IndexId]
        }
        var dbs = wx.getStorageSync(this.SYS_KEY) || "{}" //静态缓存中拿到存储数据库信息的data
        try {
            const jsonData = JSON.parse(dbs)
            if (jsonData[this.DB_NAME]) { //已经存在数据库

                if (jsonData[this.DB_NAME][name]) { //存在数据表
                    let st = jsonData[this.DB_NAME][name]
                    if (!st.indexes) {
                        console.error('数据表 indexes 遭破坏，表将重置')
                        jsonData[this.DB_NAME][name] = data
                        return
                    }
                    if (st.keyPath != keyPath) {
                        console.error('store keyPath has 表将重置')
                        jsonData[this.DB_NAME][name] = data
                        return
                    }
                    if (st.autoIncrement != autoIncrement) {
                        console.error('store autoIncrement has Changed，表将重置')
                        jsonData[this.DB_NAME][name] = data
                        return
                    }
                    if (st.indexes.length != indexes.length) {
                        console.error('indexes有新增或删减,表将重置')
                        jsonData[this.DB_NAME][name] = data
                        return
                    }
                    jsonData[this.DB_NAME][name] = {
                        ...data,
                        rows: st.rows || [],
                        [IndexId]: st[IndexId] || this[IndexId]
                    }
                    this.rows = st.rows || []
                    this[IndexId] = st[IndexId] || this[IndexId]
                } else { //不存在数据表
                    jsonData[this.DB_NAME][name] = data
                }
            } else {
                jsonData[this.DB_NAME] = { //不存在 初始化
                    [name]: data
                }
            }
            wx.setStorageSync(this.SYS_KEY, JSON.stringify(jsonData))  //数据库内容更新
        } catch (e) {
            console.error(e)
        }
    }
    //当前storage长度
    clearCache(rows, CurCacheLength) {
        if (CurCacheLength > MAXLEN) {
            console.error('超出最长字数限制啦---,自动把最早的数据删除')
            let length1 = JSON.stringify(rows).length
            rows.shift()
            let length2 = JSON.stringify(rows).length
            const dalta = length1 - length2
            if (CurCacheLength - dalta <= MAXLEN) {
                return rows
            } else {
                return this.clearCache(rows, CurCacheLength - dalta)
            }
        } else {
            return rows
        }
    }

    update() {
        let { name, rows } = this
        var dbs = wx.getStorageSync(this.SYS_KEY) || "{}" //静态缓存中拿到存储数据库信息的data
        try {
            const jsonData = JSON.parse(dbs)
            if (jsonData.length > MAXLEN) {
                rows = this.clearCache(rows, jsonData.length)
            }
            jsonData[this.DB_NAME][name].rows = rows
            jsonData[this.DB_NAME][name][IndexId] = this[IndexId]
            console.info(`数据库：${this.DB_NAME}，数据表${name},rows:`, rows)
            wx.setStorageSync(this.SYS_KEY, JSON.stringify(jsonData))  //数据库内容更新
        } catch (e) {
            console.error(e)
        }
    }

    //验证新增项中对于unique项，是否有重复,验证通过返回true  前提unique项的值是非对象形式
    verifyIsUniqueOk(uniqueKey: string, value) {
        let v = this.rows.find(item => {
            return item[uniqueKey] === value
        }) ? false : true
        return v
    }

    //新增一项，需判断item是否包含所有必填项keyPaths
    add(item) {
        for (let key in item) {
            if (this.keyPaths[key]) {
                let { name, unique, keyPath } = this.keyPaths[key]
                if (!!unique) {
                    let verify = this.verifyIsUniqueOk(keyPath, item[key])
                    if (!verify) {
                        console.error(`unique项${key}重复添加相同值item[key]，将不被添加`)
                        return
                    }
                }
            }
        }
        this[IndexId]++
        const it = {
            [IndexId]: this[IndexId],
            ...item
        }
        this.rows.push(it)
        this.update()
        return this[IndexId]
    }
    //无添加，有替换
    put(item) {
        if (item[IndexId]) {
            return this.putByIndexId(item[IndexId], item)
        } else {
            return this.add(item)
        }
    }

    putByIndexId(indexId, item) {
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i][IndexId] === indexId) {
                this.rows[i] = {
                    ...item
                }
                this.update()
                return item
            }
        }
    }


    //value是对应keyPath的值  null 或者item
    getByKeyValue(value) {
        if (this.keyPath) {
            return this.rows.find(item => {
                return item[this.keyPath] === value
            })
        }
        return
    }

    get(_id_) {
        if (this.keyPath) {
            return this.rows.find(item => {
                return (item[IndexId] === _id_)
            })
        }
        return
    }



    //找到满足条件的所有项
    query(keyName, value): Array<any> {
        let res = this.rows.filter(item => {
            return item[keyName] && item[keyName] === value
        })
        return res
    }
    //找到满足条件的第一项
    find(keyName, value) {
        return this.rows.find(item => {
            return item[keyName] && item[keyName] === value
        })
    }

    //删除一项，入参是keyPath对应的值
    deleteByKeyvalue(uniqueValue) {
        if (this.keyPath) {
            for (let i = 0; i < this.rows.length; i++) {
                if (this.rows[i][this.keyPath] === uniqueValue) {
                    const id = this.rows[i][IndexId]
                    this.rows.splice(i, 1)
                    this.update()
                    return id  //被删除的id值返回
                }
            }
        }
        return
    }

    delete(_id_) {
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i][IndexId] === _id_) {
                this.rows.splice(i, 1)
                this.update()
                return _id_  //被删除的id值返回
            }
        }
    }

    //删除一项，接收的是一条数据
    remove(obj) {
        if (this.keyPath) {
            const uniqueValue = obj[this.keyPath]
            return this.delete(uniqueValue)
        }
        return
    }

    select(selectItems: Array<QueryData>) {
        let responseData = []
        selectItems.map(item => {
            const { key, value } = item
            const obj = this.query(key, value)
            responseData = responseData.concat(obj)
        })
        return responseData
    }

    async all() {
        let allRows = this.rows
        return allRows
    }

    async last() {
        return this.rows.length > 0 ? this.rows[this.rows.length - 1] : null
    }

    batch(batches) {
        const res = []
        for (let i = 0; i < batches.length; i++) {
            const batch_ = batches[i]
            res.push(
                batch_(this)
            )
        }
        return res
    }
}