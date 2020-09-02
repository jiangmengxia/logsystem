
import ajax from './lib/ajax'
import { LogConfig, ResponseData, RET } from './interface'
import log_configer from './log_configer'

class LogReporter {
    private config: LogConfig
    private duration = 3000 //默认隔3秒重新请求
    private repeat = 0
    private handleResponse: Function
    private handleRequest: Function
    constructor() {
        console.log('LogReporter 获取log_config', log_configer.getAll())
        // this.config = log_configer.getAll()
        this.repeat = log_configer.get('repeat') || 0
        this.duration = log_configer.get('duration') || 3000
        this.handleResponse = log_configer.get('handleResponse')
        this.handleRequest = log_configer.get('handleRequest')
    }

    async report({ data }) { //默认是重复请求3次
        // console.log('------上传的data----', data)
        const { url, method, headers = {} } = log_configer.getAll()
        if ((/^((https:\/\/)|(http:\/\/))/).test(url) === false) {
            console.error(`上报的url:${url}不符合域名格式,请重新配置`)
            return { ret: RET.FAILED, error: `${url}不符合域名格式` }
        }
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
            if (retry === 0) return data
            else return Promise.resolve(setTimeout(() => this.retry(func, (Number(retry) - 1)), (Number)(this.duration)))
        } else {
            const { ret, error } = this.handleResponse(data.data)
            console.log('----------', ret, error)
            return { ret, error }
        }
    }
}

export default LogReporter