const wrapHandler = <DataType extends Array<any>, ReturnType>(
  handler: (data: DataType) => ReturnType | Promise<ReturnType>
) => async (event: MessageEvent) => {
  const [taskId, data] = event.data as [number, DataType];

  let result: ReturnType;
  let errored = false;

  try {
    result = await handler(data);
  } catch (error) {
    errored = true;
    result = error;
  }

  postMessage([errored, taskId, result]);
};

export default wrapHandler;
