import { LogConfig } from './interface'


let globalConfig: LogConfig = {
    url: '',
};

export default {
    set: (config: LogConfig): void => {
        if (!config.url) {
            console.error('url must be provided')
        }
        globalConfig = { ...config };
    },
    get: (propertyKey: keyof LogConfig): any => {
        return globalConfig[propertyKey];
    }
};
