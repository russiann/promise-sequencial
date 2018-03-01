'use strict';
module.exports = function (promises) {

  if (!Array.isArray(promises)) {
    throw new Error('First argument need to be an array of Promises');
  }

  return new Promise((resolve, reject) => {

    let count = 0;
    let results = [];

    const iterateeFunc = (previousPromise, currentPromise) => {
      return previousPromise
        .then(function (result) {
          if (count++ !== 0) results = results.concat(result);
          return currentPromise(result, results, count);
        })
    }

    promises = promises.concat(() => Promise.resolve());

    promises
    .reduce(iterateeFunc, Promise.resolve(false))
    .then(function (res) {
      resolve(results);
    })
    /*
      The catch below makes sequential halt the execution of promises as soon as the first promise
      is rejected or an error is thrown.

      Previously, the code used to handle errors the promise sequence within the reduce function,
      without re-throwing them. This hid the error from the 'reduce' function, which would continue
      to execute promises as if nothing happened.

      // underneath the hood the code looked like this
      [ () => p1.catch()
        () => p2.catch()
        () => p3.catch()
      ].reduce(...)
        .then()

      Instead, now as soon as an error is thrown, the reduce function is halted and an outer catch
      block handles the error. E.g.

      [ () => p1
        () => p2
        () => p3
      ].reduce(...)
          .then()
          .catch()  <-- after first reject, this catch will execute and 'reduce' halt
    */
    .catch((err) => {
      return reject(err);
    });

  });
};
