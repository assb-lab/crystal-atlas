/** Single-owner lifecycle: a reset finishes disposal before any replacement is opened. */
export function databaseLoader<T extends { dispose(): Promise<void> }>(open: () => Promise<T>) {
  let pending: Promise<T> | undefined;
  let resetting: Promise<void> | undefined;
  const get = (): Promise<T> => {
    if (resetting) return resetting.then(get);
    if (!pending) {
      const attempt = Promise.resolve()
        .then(open)
        .catch((error: unknown) => {
          if (pending === attempt) pending = undefined;
          throw error;
        });
      pending = attempt;
    }
    return pending;
  };
  const reset = (): Promise<void> => {
    if (resetting) return resetting;
    const previous = pending;
    pending = undefined;
    resetting = (async () => {
      const instance = await previous?.catch(() => undefined);
      await instance?.dispose();
    })().finally(() => {
      resetting = undefined;
    });
    return resetting;
  };
  return { get, reset };
}

/** Vendor RPC can remain pending after a Worker dies; surface that failure to the UI. */
export async function withDeadline<T>(
  promise: Promise<T>,
  milliseconds: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
