// promise的声明
// 由于new Promise((resolve, reject)=>{})，所以传入一个参数（函数），叫他executor，传入就执行。
// executor里面有两个参数，一个叫resolve（成功），一个叫reject（失败）。
// 由于resolve和reject可执行，所以都是函数，我们用let声明。
class myPromise {
    // 构造器
    constructor(executor) {
        // 成功
        let resolve = () => {};
        // 失败
        let reject = () => {};
        // new的时候，传入的函数立即执行
        executor(resolve, reject);
    }
}