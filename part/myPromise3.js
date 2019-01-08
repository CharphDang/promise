// then方法
// Promise有一个叫做then的方法，里面有两个参数：onFulfilled,onRejected,成功有成功的值，失败有失败的原因
// 当状态state为fulfilled，则执行onFulfilled，传入this.value。当状态state为rejected，则执行onRejected，传入this.reason
// onFulfilled,onRejected如果他们是函数，则必须分别在fulfilled，rejected后被调用，value或reason依次作为他们的第一个参数
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
    then(onFulfilled, onRejected) {
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