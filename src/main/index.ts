let lastTaskId = 0;

const callbacks = new Map<
  number,
  [(value: any) => void, (reason: any) => void]
>();

const loadWorker = (url: string, options: WorkerOptions) => {
  const worker = new Worker(url, options);

  worker.onmessage = (event) => {
    const [errored, taskId, data] = event.data as [boolean, number, any[]];
    const [resolve, reject] = callbacks.get(taskId);

    if (!errored) resolve(data);
    else reject(data);

    callbacks.delete(taskId);
  };

  const dispatch = (data: any[], transferList: Transferable[]) => {
    const taskId = lastTaskId++;

    const promise = new Promise((resolve, reject) => {
      callbacks.set(taskId, [resolve, reject]);
    });

    worker.postMessage([taskId, data], transferList);

    return promise;
  };

  return dispatch;
};

export default loadWorker;
