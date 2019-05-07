type Callback = (error?: Error, data?: number) => void;
type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void