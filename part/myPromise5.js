// 解决链式调用
// 我门常常用到new Promise().then().then(),这就是链式调用，用来解决回调地狱
// 1、为了达成链式，我们默认在第一个then里返回一个promise。秘籍规定了一种方法，就是在then里面返回一个新的promise,称为promise2：promise2 = new Promise((resolve, reject)=>{})

// 将这个promise2返回的值传递到下一个then中
// 如果返回一个普通的值，则将普通的值传递给下一个then中
// 2、当我们在第一个then中return了一个参数（参数未知，需判断）。这个return出来的新的promise就是onFulfilled()或onRejected()的值
// 规定onFulfilled()或onRejected()的值，即第一个then返回的值，叫做x，判断x的函数叫做resolvePromise

// 首先，要看x是不是promise。
// 如果是promise，则取它的结果，作为新的promise2成功的结果
// 如果是普通值，直接作为promise2成功的结果
// 所以要比较x和promise2
// resolvePromise的参数有promise2（默认返回的promise）、x（我们自己return的对象）、resolve、reject
// resolve和reject是promise2的
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
        let promise2 = new myPromise((resolve, reject) => {
            // pending的时候，将回调存入数组
            if (this.state === 'pending') {
                this.onResolvedCallbacks.push(() => {
                    let x = onFulfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject);
                });
                this.onRejectedCallbacks.push(() => {
                    let x = onRejected(this.reason);
                    resolvePromise(promise2, x, resolve, reject);
                });
            }
            // 成功，就执行成功的回调
            if (this.state === 'fulfilled') {
                let x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
            }
            // 失败，就执行失败的回调
            if (this.state === 'rejected') {
                let x = onRejected(this.reason);
                resolvePromise(promise2, x, resolve, reject);
            }
        });
        return promise2;
    }
}