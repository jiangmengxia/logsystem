export const IndexId = `_id_`

//单个表项的配置
export interface StoreItemIndex {
    name: string, //表头的名称
    unique: boolean,
    keyPath: string  //表头的key值
}
//数据表Table项的配置
export interface StoreItem {
    name: string,//表名
    keyPath: string,//键值
    autoIncrement: boolean,//是否递增
    indexes: Array<StoreItemIndex>,//表项
    // rows?: Array<Object>
}
//数据表存储时数据
export interface StoreUpdateItem extends StoreItem {
    rows: Array<Object>
    type: `_TABLE_`,
    [IndexId]: number
}
//数据库新建时的配置项
export interface InDBConfig {
    name: string,//数据库名
    stores: Array<StoreItem> //数据表集合
}


type TimeStamp = number

export interface StoreRowItem {
    _id_: string,
    createTime: TimeStamp,
    updateTime: TimeStamp
}

export interface QueryData {
    key: string,
    value: string
}

