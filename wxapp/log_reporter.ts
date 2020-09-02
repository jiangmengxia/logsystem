
import ajax from './lib/ajax'
import { LogConfig, ResponseData, RET } from './interface'
import log_configer from './log_configer'

class LogReporter {
    private config: LogConfig
    private duration = 3000 //默认隔3秒重新请求
    private repeat = 2
    private handleResponse: Function
    private handleRequest: Function
    constructor() {
        if (log_configer) {
            this.repeat = log_configer.get('repeat') || 2
            this.duration = log_configer.get('duration') || 3000
            this.handleResponse = log_configer.get('handleResponse')
            this.handleRequest = log_configer.get('handleRequest')
        } else {
            console.error('log_configer未配置')
            // console.log('LogReporter 获取log_config', log_configer.getAll())
        }
    }

    async report({ data }) { //默认是重复请求3次
        const { url, method, headers = {} } = log_configer.getAll()
        if ((/^((https:\/\/)|(http:\/\/))/).test(url) === false) {
            console.error(`上报的url:${url}不符合域名格式,请重新配置`)
            return { ret: RET.FAILED, error: `${url}不符合域名格式` }
        }
        // console.log('待请求data', data)
        return await this.retry(
            () => {
                return ajax(url, JSON.stringify(this.handleRequest(data)), false, method || 'get',
                    { 'Content-Type': "application/json", ...headers }
                )
            }
            , this.repeat)
    }

    //未请求成功后，重复请求
    async retry(func: Function, retry: number): Promise<any> {
        const data: ResponseData = await func()
        if (data.ret === RET.FAILED) {
            if (retry === 0) {
                // console.log(`retry ${retry} ---`, data)
                return data
            }
            else return Promise.resolve(setTimeout(() => this.retry(func, (Number(retry) - 1)), (Number)(this.duration)))
        } else {
            const { ret, error } = this.handleResponse(data.data)
            // console.info(`----retry --结果返回--`, data.data)
            return { ret, error }
        }
    }
}

export default LogReporter