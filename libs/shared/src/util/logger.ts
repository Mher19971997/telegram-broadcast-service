import { ConsoleLogger as CommonLogger } from '@nestjs/common';
import { debug, error, warning } from '@telegram_broadcast_service/shared/src/util/logger-lib';

export class Logger extends CommonLogger {
  log(...message: any[]) {
    return debug(this.context, ...message);
  }
  error(...message: any[]) {
    return error(this.context, ...message);
  }
  warn(...message: any) {
    return warning(this.context, ...message);
  }
  debug(...message: any) {
    return debug(this.context, ...message);
  }
}
