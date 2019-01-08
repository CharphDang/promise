// 解决基本状态
// Promise规定：
// Promise存在三个状态（state）pending、fulfilled、rejected
// pending（等待态）为初始态，并可以转化为fulfilled（成功态）和rejected（失败态）
// 成功时，不可转为其他状态，且必须有一个不可改变的值（value）
// 失败时，不可转为其他状态，且必须有一个不可改变的原因（reason）
// new Promise((resolve, reject)=>{resolve(value)}) resolve为成功，接收参数value，状态改变为fulfilled，不可再次改变。
// new Promise((resolve, reject)=>{reject(reason)}) reject为失败，接收参数reason，状态改变为rejected，不可再次改变。
// 若是executor函数报错 直接执行reject();
class myPromise {
    // 构造器
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;

        // 成功
        let resolve = (value) => {
        	// 只有pending时才会改变状态
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
            }
        };
        // 失败
        let reject = (reason) => {
        	// 只有pending时才会改变状态
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.value = reason;
            }
        };
        // new的时候，传入的函数立即执行
        try {
            executor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }
}