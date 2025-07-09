import { promisify } from 'util';

const timeout = promisify(setTimeout);

const retryCodes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'terminated', 'closed', 'lost'];

export class CPromise<T> extends Promise<T> {
  static async retry<T>(call: () => Promise<T>, attempt: number): Promise<T | undefined> {
    let lAttempt = attempt;
    do {
      --lAttempt;
      try {
        const result: T = await call();
        lAttempt = -1;
        return result;
      } catch (err) {
        const canRetry = !!((err.code || err.message) && retryCodes.find((val) => (err.code || err.message).includes(val)));
        if (!canRetry || lAttempt === 0) {
          throw err;
        }
        await timeout(300);
      }
    } while (lAttempt >= 0);
  }

  static silence<T>(call: () => Promise<T>): Promise<T | undefined> {
    try {
      return call();
    } catch (err) {
      console.log('silence:', err);
    }
  }
}
