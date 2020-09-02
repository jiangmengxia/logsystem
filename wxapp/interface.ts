export const NOOP = function (): void { /* Noop */ };
import { DBLogItem } from "./log_db";
//前端注册时的日志结构
export interface LogItem {
    content: any, //日志内容
    type?: string,//日志类型
    isImmediate?: boolean,
}
export enum Method {
    GET = 'GET',
    POST = 'POST'
}

export interface LogConfig {
    useWorker?: boolean,
    // XHR 请求相关
    url: string,
    method?: Method | Method.POST,
    headers?: object, // 默认'Content-Type': "application/json"，可进行配置覆盖
    handleResponse(string): ResponseData, //入参是请求的response,对数据处理了，预期返回{ret,data,error}
    handleRequest(logs: Array<DBLogItem>): { data: Array<any> }, //日志提交前的封装 formatter 返回上传时候的格式 ([logItem])

    repeat?: number,// 上报时，重复请求次数设置，默认3
    duration?: number,// 上报时，重复请求的时间限制（单位：ms） //默认3000ms
    // 日志元数据
    metaData?: object // 日志元数据，共有的数据，包含版本信息、域名等
    // 数据库相关
    DBName?: string,
    isOnebyone?: boolean //是否一条一条上传
}


export enum RET {
    SUCCESS = 1,
    FAILED = 0
}

export interface ResponseData {
    ret: RET,
    data?: any,
    error?: any
}

