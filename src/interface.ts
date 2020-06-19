export const NOOP = function (): void { /* Noop */ };

//前端注册时的日志结构
export interface LogItem {
    content: string, //日志内容
    type: string,//日志类型
}
export enum Method {
    GET = 'GET',
    POST = 'POST'
}

export interface LogConfig {
    useWorker?: boolean,
    //XHR 请求相关
    url: string,
    method?: Method | Method.POST,
    headers?: object,
    repeat?: number,//上报时，重复请求次数设置
    duration?: number,//上报时，重复请求的时间限制
    //日志元数据
    metaData?: Object //日志元数据
    //数据库相关
    DBName?: string,
}


export enum RET {
    SUCCESS = 1,
    FAILED = 0
}

export interface ResponseData {
    ret: RET,
    data?: any
}