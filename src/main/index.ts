import { WorkerMessage } from '../shared';

type WorkerDispatcher = (data: any, transferList?: Transferable[]) => any;

let lastTaskId = 0;

const callbacks = new Map<
  number,
  [(value: any) => void, (reason: any) => void]
>();

export const loadWorker = (
  url: string,
  options?: WorkerOptions
): WorkerDispatcher => {
  const worker = new Worker(url, options);

  worker.onmessage = (event): void => {
    const [errored, taskId, result] = event.data as WorkerMessage;
    const [resolve, reject] = callbacks.get(taskId);

    if (!errored) resolve(result);
    else reject(result);

    callbacks.delete(taskId);
  };

  const dispatch: WorkerDispatcher = (data, transferList?) => {
    const taskId = lastTaskId++;

    const promise = new Promise((resolve, reject) => {
      callbacks.set(taskId, [resolve, reject]);
    });

    worker.postMessage([taskId, data], transferList);

    return promise;
  };

  return dispatch;
};
