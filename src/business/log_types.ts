// const LogTypes = ['Http异常', '网络异常', '业务异常', '硬件异常', '客户端Carsh', '网络日志', '性能采集', '学情埋点']

export const LogTypeDefs = {
    //Http异常
    'ERR_NETWORK_HTTP_40X': {
        code: 'ERR_HTTP_40X',
        intCode: '140X',
        des: 'Http状态码40X',
        type: 'Http异常'
    },
    'ERR__NETWORK_HTTP_50X': {
        code: 'ERR_HTTP_50X',
        intCode: '150X',
        des: 'Http状态码50X',
        type: 'Http异常'
    },
    //网络异常
    'ERR_NETWORK_TIMEOUT': {
        code: 'ERR_SocketTimeout',
        intCode: '1600',
        des: '网络超时',
        type: '网络异常'
    },
    'ERROR_NETWORK_UNKNOWHOST': {
        code: 'ERR_UnknownHost',
        intCode: '1610',
        des: '未知主机',
        type: '网络异常'
    },
    // 业务异常
    'ERROR_BUSINESS_ILLEGAL_ARGUMENT': {
        code: 'ERR_BIZ_IllegalArgument',
        intCode: '1700',
        des: '接口返回格式与约定不一致',
        type: '业务异常'
    },
    'ERROR_BUSINESS_': {
        code: 'ERR_BIZ_业务异常码',
        intCode: '1710',
        des: '接口业务异常',
        type: '业务异常'
    },
    //硬件异常
    'ERROR_HARDWARE_CAMERA': {
        code: 'ERR_HARDWARE_100',
        intCode: '1810',
        des: '摄像头拍照调用异常',
        type: '硬件异常'
    },
    'ERROR_HARDWARE_MICROPHONE': {
        code: 'ERR_HARDWARE_200',
        intCode: '1820',
        des: '录音麦克风调用异常',
        type: '硬件异常'
    },
    'ERROR_HARDWARE_STORAGE': {
        code: 'ERR_HARDWARE_300',
        intCode: '1830',
        des: '存储调用异常',
        type: '硬件异常'
    },
    'ERROR_HARDWARE_OTHER': {
        code: 'ERR_HARDWARE_400',
        intCode: '1800',
        des: '其它硬件异常',
        type: '硬件异常'
    },
    //客户端异常
    'ERROR_CLIENT_OOM': {
        code: 'ERR_CARSH_OMM',
        intCode: '1910',
        des: 'OOM',
        type: '客户端异常'
    },
    'ERROR_CLIENT_ANR': {
        code: 'ERR_CARSH_ANR',
        intCode: '1920',
        des: 'ANR',
        type: '客户端异常'
    },
    'ERROR_CLIENT_OTHER': {
        code: 'ERR_CARSH_000',
        intCode: '1900',
        des: '其它Carsh异常',
        type: '客户端异常'
    },
    //网络日志
    'INFO_NETWORK_REQUEST': {
        code: 'NETWORK_000',
        intCode: '2000',
        des: '请求日志',
        type: '网络日志'
    },
    //性能采集异常
    'INFO_PERFORMANCE_PAGE_RENDER': {
        code: 'STATSPACK_100',
        intCode: '2100',
        des: '页面渲染',
        type: '性能采集异常'
    },
    'INFO_PERFORMANCE_BATTERY_POWER': {
        code: 'STATSPACK_200',
        intCode: '2200',
        des: '电池电量',
        type: '性能采集异常'
    },
    'INFO_PERFORMANCE_NETWORK_FLOW': {
        code: 'STATSPACK_300',
        intCode: '2300',
        des: '网络流量',
        type: '性能采集异常'
    },
    //学情埋点
    'INFO_EVENT_BURIED_POINT': {
        code: 'USER_000',
        intCode: '3000',
        des: '用户行为事件',
        type: '学情埋点'
    }
}
//学情埋点类型
export const eventTypes = {
    'EVENT_CLICK': {
        code: 'EVENT_CLICK_100',
        type: '点击操作',
        desc: '应用内点击',
        // belongs:
    },
    //浏览页面
    'EVENT_PAGE_OPEN': {
        code: 'EVENT_PAGE_100',
        type: '浏览页面',
        desc: '打开页面'
    },
    'EVENT_PAGE_LEAVE': {
        code: 'EVENT_PAGE_110',
        type: '浏览页面',
        desc: '离开页面'
    },
    //手势操作
    'EVENT_GESTURE_SWIPE_UP': {
        code: 'EVENT_GESTURE_100',
        type: '手势操作',
        desc: '向上滑动'
    },
    'EVENT_GESTURE_SWIPE_DOWN': {
        code: 'EVENT_GESTURE_110',
        type: '手势操作',
        desc: '向下滑动'
    },
    'EVENT_GESTURE_SWIPE_LEFT': {
        code: 'EVENT_GESTURE_120',
        type: '手势操作',
        desc: '向左滑动'
    },
    'EVENT_GESTURE_SWIPE_RIGHT': {
        code: 'EVENT_GESTURE_130',
        type: '手势操作',
        desc: '向右滑动'
    },
    //
    'EVENT_GESTURE_DRAG': {
        code: 'EVENT_GESTURE_200',
        type: '手势操作',
        desc: '拖动'
    },
    'EVENT_GESTURE_DOUBLE_FINGERS_ZOOM_IN': {
        code: 'EVENT_GESTURE_300',
        type: '手势操作',
        desc: '双指放大'
    },
    'EVENT_GESTURE_DOUBLE_FINGERS_ZOOM_OUT': {
        code: 'EVENT_GESTURE_310',
        type: '手势操作',
        desc: '双指缩小'
    },
    'EVENT_GESTURE_CORECT_CIRCLE': {
        code: 'EVENT_GESTURE_410',
        type: '手势操作',
        desc: '批改画圈'
    },
    //视频操作
    "EVENT_VIDEO_START": {
        code: 'EVENT_VIDEO_100',
        type: '视频操作',
        desc: '视频开始播放'
    },
    "EVENT_VIDEO_STOP": {
        code: 'EVENT_VIDEO_110',
        type: '视频操作',
        desc: '视频暂停播放'
    },
    "EVENT_VIDEO_FINISH": {
        code: 'EVENT_VIDEO_120',
        type: '视频操作',
        desc: '视频播放完成'
    },
    "EVENT_VIDEO_>>": {
        code: 'EVENT_VIDEO_130',
        type: '视频操作',
        desc: '视频拖拽快进'
    },
    "EVENT_VIDEO_<<": {
        code: 'EVENT_VIDEO_140',
        type: '视频操作',
        desc: '视频拖拽快退'
    },
    //按键操作 安卓端
}
// //日志元数据
// export const logMetaData = {
//     // appId
//     a: "",
//     // logType
//     t: 3000,
//     // deviceId
//     d: "deviceId",
//     c: {
//         userId: "",
//         token: "",
//         clientTime: "",
//         versionName: "仅APP提供",
//         versionCode: "仅APP提供",
//         location: "仅APP提供",
//         cityCode: "仅APP提供",
//         adCode: "仅APP提供",
//         networkStatus: "",
//         // 单次启动应用到关闭应用周期内的标识
//         appSessionId: "",
//         // 打开页面到关闭/离开页面周期内的标识
//         pageSessionId: "",
//         // 当前页面ID :安卓是包路径+类名，H5是URL
//         pageId: "",
//         pageTitle: ""
//     }
// }

