/**
 * @file This file is to arrange logan operations in queue, in order to avoid parallel async writing operations on db which may cause race condition problems.
 * 
 * 由于Logan的log方法涉及LoganDB日志存储空间大小的改写、report方法在做增量上报时涉及本地日志数据的删除，这些方法被异步执行时可能会发生竞态条件导致DB内数据不准确，进而导致已存储的日志大小远超过存储空间限制、在触发上报时段写入的日志被删除这类问题，因此Logan需要内部维护该执行列表，确保这些异步方法按序一一执行。
 * 
 */
class OperationQueue {
    private queue: PromiseItem[] = [];
    private operationRunning = false //队列是否是激活状态
    // private initState = true //表示队列未被激活过
    constructor() {
        this.queue = []
    }

    private async loganOperationsRecursion(): Promise<void> {
        while (this.queue.length > 0 && !this.operationRunning) {
            const nextOperation = this.queue.shift() as PromiseItem;
            // console.log('取一条记录', nextOperation)
            // console.log('剩余记录', this.queue.length)
            this.operationRunning = true;
            try {
                const result = await nextOperation.asyncF();
                nextOperation.resolveF(result);
            } catch (e) {
                nextOperation.rejectF(e);
            }
            this.operationRunning = false;
            this.loganOperationsRecursion();
        }
        // if (this.queue.length === 0 && this.initState === false) {
        //     console.info('执行完毕', Date.now())
        //     this.initState = true
        // }
    }
    async invokeInQueue(asyncF: Function): Promise<any> {
        // if (this.initState === true) this.initState = false
        return new Promise((resolve, reject) => {
            this.queue.push({
                asyncF,
                resolveF: resolve,
                rejectF: reject
            });
            // console.log('插入一条记录,剩余：', this.queue.length)
            this.loganOperationsRecursion();
        });
    }
}


interface PromiseItem {
    asyncF: Function,
    resolveF: Function,
    rejectF: Function,
}

export default OperationQueue