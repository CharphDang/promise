// 解决其他问题
// 1、规定onFulfilled,onRejected都是可选参数，如果他们不是函数，必须被忽略

// onFulfilled返回一个普通的值，成功时直接等于 value => value
// onRejected返回一个普通的值，失败时如果直接等于 value => value，则会跑到下一个then中的onFulfilled中，所以直接扔出一个错误reason => throw err 
// 
// 2、秘籍规定onFulfilled或onRejected不能同步被调用，必须异步调用。我们就用setTimeout解决异步问题
// 如果onFulfilled或onRejected报错，则直接返回reject()
// 顺便附赠catch和resolve、reject、race、all方法
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
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
        let promise2 = new myPromise((resolve, reject) => {
            // pending的时候，将回调存入数组
            if (this.state === 'pending') {
                setTimeout(() => {
                    this.onResolvedCallbacks.push(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }

                    });
                    this.onRejectedCallbacks.push(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (err) {
                            reject(err);
                        }

                    });
                });
            }
            // 成功，就执行成功的回调
            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (err) {
                        reject(err);
                    }

                });

            }
            // 失败，就执行失败的回调
            if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (err) {
                        reject(err);
                    }

                });

            }
        });
        return promise2;
    }
}
//resolve方法
myPromise.resolve = function(val) {
    return new myPromise((resolve, reject) => {
        resolve(val);
    });
}
//reject方法
myPromise.reject = function(reason) {
    return new myPromise((resolve, reject) => {
        reject(reason);
    });
}

// 用于promise方法链时 捕获前面onFulfilled/onRejected抛出的异常
myPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}

//race方法
myPromise.race = function(promises) {
    return new myPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolve, reject)
        };
    })
}
//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回) 
myPromise.all = function(promises) {
    let arr = [];
    let i = 0;

    function processData(index, data, resolve) {
        arr[index] = data;
        i++;
        if (i == promises.length) {
            resolve(arr);
        };
    };
    return new myPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                processData(i, data, resolve);
            }, reject);
        };
    });
};

// 目前是通过他测试 他会测试一个对象
// 语法糖
myPromise.defer = myPromise.deferred = function() {
    let dfd = {}
    dfd.promise = new myPromise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
};

module.exports = myPromise;