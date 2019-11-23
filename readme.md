<div align="center">
  <h1>ɪ ɴ ᴛ ᴇ ʀ ᴘ ʜ ᴏ ɴ ᴇ</h1>

  `$ npm i interphone`

  [![](https://img.shields.io/npm/v/interphone?style=flat-square)](https://www.npmjs.com/package/interphone)
  [![](https://img.shields.io/bundlephobia/min/interphone?style=flat-square)](https://bundlephobia.com/result?p=interphone)
  [![](https://img.shields.io/bundlephobia/minzip/interphone?style=flat-square)](https://bundlephobia.com/result?p=interphone)
</div>

<hr />

Interphone provides a realiable and predictable wrapper for effortless communication with web workers.

- [Introduction](#introduction)
- [Usage](#usage)
  - [On the main thread](#on-the-main-thread)
  - [In the worker](#in-the-worker)
- [Error handling](#error-handling)
- [When not to use it](#when-not-to-use-it)
- [License](#license)

## Introduction
Web workers are incredibly useful for offloading work from the main thread. Their message-based API, however, can be very unpredictable (besides being quite tedious to master). Consider this code:

```javascript
// [index.js]
const worker = new Worker('worker.js');
worker.onmessage = (result) => console.log(`The result is: ${result}`)
worker.postMessage([/* ... */]);


// [worker.js]
self.onmessage = ({ data }) => {
  // Very compute-intensive operations
  postMessage(result);
};
```

Seems fine. But what if we posted two messages? Three? Twenty? We would (hopefully :man_shrugging:) receive two/three/twenty messages back, but the order might be incorrect, and we would not be able to tell which one corresponds to which of ours.

Interphone solves this by wrapping the worker in an asynchronous function, eliminating all the hassle of using `postMessage`. With Interphone, the code above would become:

```javascript
// [index.js]
import { loadWorker } from 'interphone/main';

const worker = loadWorker('worker.js');
worker([/* ... */]).then((result) => console.log(`The result is: ${result}`));


// [worker.js]
import { wrapHandler } from 'interphone/worker';

self.onmessage = wrapHandler(({ data }) => {
  // Very compute-intensive operations
  return result; // This can also be a promise
});
```

As you can see, by invoking the worker with Interphone, we can be sure that every call to the worker will give the correct result, no matter the order of calls or how long the computation takes.


## Usage

### On the main thread
> import from `interphone/main` or just `interphone`

Importing and using a worker is incredibly easy. Just load it with `loadWorker` and you will have access to an asynchronous function that invokes your worker and returns as soon as the worker has finished. Let's see an example:

```javascript
import { loadWorker } from 'interphone/main';

const concatenateWorker = loadWorker('concatenate-worker.js');

// You can now call `worker` just like any async function
concatenateWorker(['This', 'is', 'so', 'cool!'])
  .then((concatenatedString) => console.log(concatenatedString));
```

### In the worker
> import from `interphone/worker` or just `interphone`

In your worker, it's even easier: just create a *synchronous or asynchronous* function that takes in the data as its only argument and returns the result. Then, wrap it with `wrapHandler` and assign
the wrapped function to `self.onmessage`. Again, an example (the `concatenate-worker.js` from before):

```javascript
import { wrapHandler } from 'interphone/worker';

const concatenateStrings = (strings) => strings.join(' '); // This could also be async

self.onmessage = wrapHandler(concatenateStrings);
```

## Error handling
If your worker happened to throw an error upon being called, it's no problem. The promise will be rejected, so you can handle the error as if it was just any asynchronous function throwing.

## When not to use it
While Interphone is great when your web workers are just like functions (that is, you invoke them with some data/arguments and it returns a *single* result), it's not that great when they are not function-like. For example, if your worker stayed in the background and emitted events every now and then, Interphone won't come in very useful.

## License
This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
