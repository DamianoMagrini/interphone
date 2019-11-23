import { WorkerMessage } from '../shared';

export const wrapHandler = <DataType, ReturnType>(
  handler: (data: DataType) => ReturnType | Promise<ReturnType>
) => async (event: MessageEvent): Promise<void> => {
  const [taskId, data] = event.data as [number, DataType];

  let result: ReturnType | Error | any;
  let errored = false;

  try {
    result = await handler(data);
  } catch (error) {
    errored = true;
    result = error;
  }

  postMessage([errored, taskId, result] as WorkerMessage);
};
