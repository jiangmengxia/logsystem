
import ajax from './lib/ajax'
import { LogConfig, ResponseData, RET } from './interface'

class LogReporter {
    private config: LogConfig
    private duration: number = 3000 //默认隔3秒重新请求
    private repeat: number = 2
    constructor(config: LogConfig) {
        this.config = config
        this.repeat = config.repeat || 2
        this.duration = config.duration || 3000
    }

    async report({ data }) { //默认是重复请求3次
        console.log('------上传的data----', data)
        const { url, method, headers = {} } = this.config
        return await this.retry(
            () => {
                return ajax(url, JSON.stringify({ data }), false, method || 'get',
                    { 'Content-Type': "application/json", ...headers }
                    // headers
                )
            }
            , this.repeat)
    }

    //未请求成功后，重复请求
    async retry(func: Function, retry: number = 0): Promise<any> {
        const data: ResponseData = await func()
        console.log('retry:', retry, data.ret)
        if (data.ret === RET.FAILED) {
            if (retry === 0) return data
            else return Promise.resolve(setTimeout(() => this.retry(func, retry - 1), this.duration))
        }
        return data
    }
}

export default LogReporter