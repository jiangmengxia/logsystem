
import LogRegister from './log_register'
import { LogConfig } from "./interface";

//测试用
export default function logRegist(logConfig: LogConfig) {
    const lr = new LogRegister(logConfig)
    return lr  //lr 使用report上传日志   直接调用lr.report(log:LogItem)
}


