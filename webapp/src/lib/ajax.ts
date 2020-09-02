import XHR from './xhr';
import { RET } from '../interface';
export default async (url: string, data?: any, withCredentials?: boolean, type?: 'GET' | 'POST' | string, headers?: Record<string, any>): Promise<any> => {
    return new Promise((resolve, reject) => {
        XHR({
            url,
            type: type || 'GET',
            data,
            withCredentials: !!withCredentials,
            headers: headers,
            success: (responseText: any) => {
                resolve({ ret: RET.SUCCESS, data: responseText })
            },
            fail: (err: string) => {
                console.log('-------xhr failed------')
                resolve({ ret: RET.FAILED, error: err || 'Request failed' })
            }
        });
    });
};


