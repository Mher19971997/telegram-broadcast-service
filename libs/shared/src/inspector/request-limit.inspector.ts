import * as c from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';
import { omit } from 'lodash';
import { promisify } from 'util';
import { json5 } from '@telegram_broadcast_service/shared/src/util/parser/json5';

@c.Injectable()
export class RequestLimitInspector implements c.NestInterceptor {
  private hash: Map<any, any> = new Map();
  private timeout = promisify(setTimeout);
  private readonly logger = new c.Logger(RequestLimitInspector.name);

  intercept(context: c.ExecutionContext, next: c.CallHandler): Observable<any> {
    const reqType = context.getType();
    const httpContext = context.switchToHttp();

    if (reqType === 'http') {
      const httpReq = httpContext.getRequest<Request & { fingerprint: any }>();
      if (httpReq.method !== 'GET' || httpReq.query.noCache) {
        httpReq.query = omit(httpReq.query, 'noCache');
        return next.handle();
      }

      const key = `${json5.stringify(httpReq.fingerprint)}-${httpReq.method}-${httpReq.url}`;
      const isDuplicate = this.hash.has(key);
      queueMicrotask(async () => {
        await this.timeout(2000);
        this.logger.debug(`removing request: ${key}`);
        this.hash.delete(key);
      });

      if (isDuplicate) {
        this.logger.debug(`duplicating request: ${key}`);
        return this.hash.get(key);
      }

      return next.handle().pipe(
        map((data) => {
          this.hash.set(key, data);
          return data;
        }),
      );
    }
    return next.handle();
  }
}
