import 'reflect-metadata';

/**
 * @name stack
 */
const stack = function (): string | any[] | undefined {
  const orig: any = Error.prepareStackTrace;
  Error.prepareStackTrace = function (msg, stack) {
    return stack;
  };
  const err: any = new Error();

  Error.captureStackTrace(err, err);
  const { stack }: any = err;
  Error.prepareStackTrace = orig;
  return stack;
};

/**
 * @name line
 */
const line = function (): number | null {
  const swap = (global.__stack as any[])
    .map<any>((val: any) => ({ f: val.getFileName()?.replace(r3, '/'), l: val.getLineNumber() }))
    .filter((val) => val.f && !val.f.match(r1));
  return swap[swap.length - 1]?.l;
};

const r1 = new RegExp('(node_modules|node:internal)+', 'gud');
const r3 = new RegExp('\\\\', 'g');

/**
 * @name moduleFn
 */
const moduleFn = function (): string | null {
  const cwd = process.cwd()?.replace(r3, '/');
  const swap = (global.__stack as any[])
    .map<string>((val: any) => val.getFileName()?.replace(r3, '/'))
    .filter((val) => val && !val.match(r1));
  return swap[swap.length - 1].replace(cwd, '');
};

/**
 * @name functionFn
 */
const functionFn = function (): string | null {
  const swap = (global.__stack as any[])
    .map<any>((val: any) => ({ f: val.getFileName()?.replace(r3, '/'), l: val.getFunctionName() }))
    .filter((val) => val.f && !val.f.match(r1));
  return swap[swap.length - 1]?.l;
};

/**
 * @name methodFn
 */
const methodFn = function (): string | null {
  const swap = (global.__stack as any[])
    .map<any>((val: any) => ({ f: val.getFileName()?.replace(r3, '/'), l: val.getMethodName() }))
    .filter((val) => val.f && !val.f.match(r1));
  return swap[swap.length - 1]?.l;
};

Object.defineProperty(global, '__stack', { get: stack });

Object.defineProperty(global, '__line', { get: line });

Object.defineProperty(global, '__module', { get: moduleFn });

Object.defineProperty(global, '__function', { get: functionFn });

Object.defineProperty(global, '__method', { get: methodFn });
