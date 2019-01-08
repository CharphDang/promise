function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new Error('Promise循环引用'));
    }
    let called;
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    // 成功和失败只能调用一个
                    if (called) return;
                    called = true;
                    // resolve的结果依旧是promise 那就继续解析
                    resolvePromise(promise2, y, resolve, reject);
                }, err => {
                    // 成功和失败只能调用一个
                    if (called) return;
                    called = true;
                    reject(err); // 失败了就失败了
                });
            } else {
                resolve(x);
            }
        } catch (err) {
            // 也属于失败
            if (called) return;
            called = true;
            // 取then出错了那就不要在继续执行了
            reject(err);
        }
    } else {
        resolve(x);
    }
}

class Promise {
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;

        this.onResolvedCallbacks = [];
        this.onRejectedCallbacks = [];

        let resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        };
        let reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };
        try {
            executor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }
    then(onFulfilled, onRejected) {
        // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        // onRejected如果不是函数，就忽略onRejected，直接扔出错误
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

        let promise2 = new Promise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                // 异步
                setTimeout(() => {
                    try {
                        let x = onFulfilled && onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            if (this.state === 'reject') {
                // 异步
                setTimeout(() => {
                    try {
                        let x = onRejected && onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            if (this.state === 'pending') {
                this.onResolvedCallbacks.push(() => {
                    // 异步
                    setTimeout(() => {
                        try {
                            let x = onFulfilled && onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);

                });
                this.onRejectedCallbacks.push(() => {
                    // 异步
                    setTimeout(() => {
                        try {
                            let x = onRejected && onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
            }
        })
        return promise2;
    }
}

//resolve方法
Promise.resolve = function(val) {
    return new Promise((resolve, reject) => {
        resolve(val)
    });
}
//reject方法
Promise.reject = function(val) {
    return new Promise((resolve, reject) => {
        reject(val)
    });
}
//race方法 
Promise.race = function(promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolve, reject)
        };
    })
}
//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
Promise.all = function(promises) {
    let arr = [];
    let i = 0;

    function processData(index, data, resolve) {
        arr[index] = data;
        i++;
        if (i == promises.length) {
            resolve(arr);
        };
    };
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                processData(i, data, resolve);
            }, reject);
        };
    });
}

// 目前是通过他测试 他会测试一个对象
// 语法糖
Promise.defer = Promise.deferred = function() {
    let dfd = {}
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}

module.exports = Promise;