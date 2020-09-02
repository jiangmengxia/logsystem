
interface XHROpts {
    url: string;
    type: 'GET' | 'POST' | string;
    // withCredentials: boolean;
    success?: Function;
    fail?: Function;
    headers?: any;
    data?: any;
}
export default function (opts: XHROpts) {
    const { url, type, headers, success, fail, data } = opts
    wx.request({
        url,
        method: type,
        header: headers,
        data,
        success: (res) => {
            // console.log('---------xhr- res-------', res)
            if (res.statusCode === 200) {
                success && success(res.data);
            } else {
                fail && fail(`Request error:${res.errMsg}`);
            }
        },
        fail: (error) => {
            fail && fail(`Request timeout, error:${error}`);
        }
    })
}
