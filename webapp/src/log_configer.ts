import { LogConfig, NOOP } from './interface'

let globalConfig: LogConfig

export default {
    set: (config: LogConfig): void => {
        // console.log('设置config为', config)
        if (!config) {
            console.error('请配置config')
            return
        }
        if (!config.url) {
            console.error('url must be provided')
            return
        }
        globalConfig = { ...config };
    },
    get: (propertyKey: keyof LogConfig): any => {
        // console.log(`获取config key ${propertyKey}`, globalConfig[propertyKey])
        return globalConfig ? globalConfig[propertyKey] : null;
    },
    getAll: () => {
        // console.log('获取config为', globalConfig)
        return globalConfig
    }
};
