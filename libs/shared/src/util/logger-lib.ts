import { json } from '@telegram_broadcast_service/shared/src/util/parser/json';
import { json5 } from '@telegram_broadcast_service/shared/src/util/parser/json5';

export default interface LoggerInterface {
  level: 'info' | 'debug' | 'warning' | 'error';

  /**
   * @name Log
   * @param data
   * @param type
   * @constructor
   */
  Log(data: any, type?: this['level']): void;

  /**
   * @name Return
   * @param data
   * @constructor
   */
  Return(...data: any[]): void;
}

export interface LoggerOptions {
  level: 'info' | 'debug' | 'warning' | 'error';
}

const wd = process.cwd();

/**
 * @name logger
 * @param args
 */
const logger = (...args: any[]) => process.stdout.write(`${args[0]} \n`);

/**
 * @name Log
 * @param level
 * @constructor
 */
const Log = (level: LoggerInterface['level']): LoggerInterface['Return'] => {
  const loglevel: any = (global.Configs && Configs.get<LoggerOptions['level']>('app.logging')) || 'debug';
  return (...data: any[]): boolean => {
    const moduleFile = `${global.__module}:${global.__method || global.__function || 'anonymous'}():${(global as any).__line}`;

    if (level === 'error') {
      return logError(level, moduleFile, data);
    }
    if (loglevel === 'debug') {
      return logMessage(level, moduleFile, data);
    }
    if (loglevel === level) {
      return logMessage(level, moduleFile, data);
    }
    return false;
  };
};

/**
 * @name logMessage
 * @param level
 * @param moduleFile
 * @param message
 */
const logMessage = (level: LoggerInterface['level'], moduleFile: string, message: any) => {
  const initial: any = (global.Configs && Configs.get<string>('app.name')) || 'initial';
  return logger(`[${level}] [${initial}] [${moduleFile.replace(wd, '').replace(/\\/gu, '/')}] [${json5.stringify(message)}]`);
};

/**
 * @name logError
 * @param level
 * @param moduleFile
 * @param message
 */
const logError = (level: LoggerInterface['level'], moduleFile: string, message: any[]) =>
  logger(
    `[${level}] [${moduleFile.replace(wd, '').replace(/\\/gu, '/')}] [${json5.stringify(
      (message instanceof Error &&
        ((): any => {
          const stackSlice = (message.stack || '')
            .replace(/\\/gu, '/')
            .replace(new RegExp(process.cwd().replace(/\\/gu, '/'), 'ugm'), '')
            .split('\n');
          const stack = (json.stringify(stackSlice.splice(1, 2)) || '').replace(/ {2}/gmu, '').replace(/\\/gu, '/');
          return `name: ${message.name}, message: ${message.message}, ${stack}`;
        })()) ||
        message,
    )}]`,
  );

/**
 * @name error
 */
export const error = Log('error');

/**
 * @name warning
 */
export const warning = Log('warning');

/**
 * @name debug
 */
export const debug = Log('debug');

/**
 * @name info
 */
export const info = Log('info');
