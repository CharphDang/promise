// 解决异步实现
// 现在基本可以实现简单的同步代码，但是当resolve在setTomeout内执行，then时state还是pending等待状态 
// 我们就需要在then调用的时候，将成功和失败存到各自的数组，一旦reject或者resolve，就调用它们
// 类似于发布订阅，先将then里面的两个函数储存起来，由于一个promise可以有多个then，所以存在同一个数组内。
// 成功或者失败时，forEach调用它们
class myPromise {
    // 构造器
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;

        // 用来存储then中的回调
        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];

        // 成功
        let resolve = (value) => {
            // 只有pending时才会改变状态
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                // 执行数组中保存的回调
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        };
        // 失败
        let reject = (reason) => {
            // 只有pending时才会改变状态
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.value = reason;
                // 执行数组中保存的回调
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };
        // new的时候，传入的函数立即执行
        try {
            executor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }
    then(onFulfilled, onRejected) {
    	// pending的时候，将回调存入数组
        if (this.state === 'pending') {
            this.onResolvedCallbacks.push(() => {
                onFulfilled(this.value)
            });
            this.onRejectedCallbacks.push(() => {
                onRejected(this.reason);
            });
        }
        // 成功，就执行成功的回调
        if (this.state === 'fulfilled') {
            onFulfilled(this.value);
        }
        // 失败，就执行失败的回调
        if (this.state === 'rejected') {
            onRejected(this.reason);
        }
    }
}