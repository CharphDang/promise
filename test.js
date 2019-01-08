require('./es6Promise');

let promise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 0);
});

promise1.then((data) => {
    console.log(data, 'datadatadata');
});