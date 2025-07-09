import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { parse } from 'qs';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class UrlParserInspector implements NestInterceptor {
  intercept(context: ExecutionContext, stream$: CallHandler): Observable<any> {
    const host = context.switchToHttp();
    const type = context.getType();
    if (type === 'http') {
      const request = host.getRequest<Request>();
      request.query = parse(request.url.split('?')[1], { depth: 20 });
    }

    return stream$.handle();
  }
}
