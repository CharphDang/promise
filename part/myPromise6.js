// 完成resolvePromise函数
// 规定了一段代码，让不同的promise代码互相套用，叫做resolvePromise

// 如果 x === promise2，则是会造成循环引用，自己等待自己完成，则报“循环引用”错误
// 
// let p = new Promise(resolve => {
//   resolve(0);
// });
// var p2 = p.then(data => {
//   // 循环引用，自己等待自己完成，一辈子完不成
//   return p2;
// })
// 
// 1、判断x

// Otherwise, if x is an object or function,Let then be x.then
// x 不能是null
// x 是普通值 直接resolve(x)
// x 是对象或者函数（包括promise），let then = x.then 2、当x是对象或者函数（默认promise）
// 声明了then
// 如果取then报错，则走reject()
// 如果then是个函数，则用call执行then，第一个参数是this，后面是成功的回调和失败的回调
// 如果成功的回调还是pormise，就递归继续解析 3、成功和失败只能调用一个 所以设定一个called来防止多次调用
function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('promise循环引用!'));
    }
    // 避免多次调用
    let called = false;
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    // resolve的结果依旧是promise 那就继续解析
                    resolvePromise(promise2, y, resolve, reject);
                }, err => {
                    if (called) return;
                    called = true;
                    reject(err);
                })
            } else {
                // 说明是一个普通对象、函数
                resolve(x);
            }
        } catch (err) {
            if (called) return;
            called = true;
            reject(err);
        }
    } else {
        resolve(x);
    }
};
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