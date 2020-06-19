type MiliSeconds = number;
export const K_BYTE = 1024;
export const M_BYTE = 1024 * K_BYTE;
export function sizeOf(str: string): number {
    let total = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        const charCode = str.charCodeAt(i);
        if (charCode <= 0x007f) {
            total += 1;
        } else if (charCode <= 0x07ff) {
            total += 2;
        } else if (charCode <= 0xffff) {
            total += 3;
        } else {
            total += 4;
        }
    }
    return total;
}

export function isValidDay(day: string): boolean {
    if (typeof day !== 'string') {
        return false;
    } else {
        const dayParts = day.split('-');
        const M = parseInt(dayParts[1]);
        const D = parseInt(dayParts[2]);
        return (
            M > 0 &&
            M <= 12 &&
            D > 0 &&
            D <= 31 &&
            new Date(day).toString() !== 'Invalid Date'
        );
    }
}

export function dateFormat2Day(date: Date): string {
    const Y = date.getFullYear();
    const M = date.getMonth() + 1;
    const D = date.getDate();
    return `${Y}-${M < 10 ? '0' + M : M}-${D < 10 ? '0' + D : D}`;
}

export function getStartOfDay(date: Date): MiliSeconds {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ).getTime();
}

export function dayFormat2Date(day: string): Date {
    const [year, month, date] = (day.match(/(\d+)/g) || []).map(n => parseInt(n));
    if (year < 1000) {
        throw new Error(`Invalid dayString: ${day}`);
    }
    return new Date(year, month - 1, date);
}


export const ONE_DAY_TIME_SPAN = 24 * 60 * 60 * 1000;


//时间戳转换成日期，如2020-02-11 01:00:00
export function timestampToDateTime(timestamp = Date.now(), format = 'yyyy-MM-dd HH:mm:ss') {
    if (isNaN(timestamp)) {
        return '';
    }

    if (format.length < 4 || 'yyyy-MM-dd HH:mm:ss'.indexOf(format) !== 0) {
        return '';
    }

    const date = new Date(Number(timestamp));
    const year: number = date.getFullYear();
    const month: number = date.getMonth() + 1;
    const day: number = date.getDate();
    const hour: number = date.getHours();
    const minute: number = date.getMinutes();
    const second: number = date.getSeconds();

    return format.replace('yyyy', `${year}`)
        .replace('MM', `${month > 9 ? month : `0${month}`}`)
        .replace('dd', `${day > 9 ? day : `0${day}`}`)
        .replace('HH', `${hour > 9 ? hour : `0${hour} `}`)
        .replace('mm', `${minute > 9 ? minute : `0${minute}`}`)
        .replace('ss', `${second > 9 ? second : `0${second}`}`);
} 
