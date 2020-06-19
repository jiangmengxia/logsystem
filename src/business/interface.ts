
export interface LogMetaData {
    // appId
    a: string,
    // logType
    t: string, //log_type.ts 中
    // deviceId
    d: string | "devideId",
    c: {
        userId: string,
        token: string,
        clientTime: string,
        versionName?: string | "仅APP提供",
        versionCode?: string | "仅APP提供",
        location?: string | "仅APP提供",
        cityCode?: string | "仅APP提供",
        adCode?: string | "仅APP提供",
        networkStatus: string,
        // 单次启动应用到关闭应用周期内的标识
        appSessionId: string,
        // 打开页面到关闭/离开页面周期内的标识
        pageSessionId: string,
        // 当前页面ID :安卓是包路径+类名，H5是URL
        pageId: string,
        pageTitle: string
    }
}

export interface MetaData {
    userId: string,
    token: string,
    clientTime: string,
    versionName?: string | "仅APP提供",
    versionCode?: string | "仅APP提供",
    location?: string | "仅APP提供",
    cityCode?: string | "仅APP提供",
    adCode?: string | "仅APP提供",
    networkStatus: "",
    // 单次启动应用到关闭应用周期内的标识
    appSessionId: "",
    // 打开页面到关闭/离开页面周期内的标识
    pageSessionId: "",
    // 当前页面ID :安卓是包路径+类名，H5是URL
    pageId: "",
    pageTitle: ""
}


//学情埋点日志信息
export interface LogEventData {
    // 日志内容
    c: {
        eventType: string,
        elementId: string,
        elementTitle: string,
        sceneId: string,
        patternId: string,
        questionId: string,
        answerRecordId: string,
        taskId: string,
        examId: string
    }
}