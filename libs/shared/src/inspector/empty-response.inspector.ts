import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { isNull, isUndefined } from 'lodash';
import { Response } from 'express';

@Injectable()
export class EmptyResponseInspector implements NestInterceptor {
  intercept(context: ExecutionContext, stream$: CallHandler): Observable<any> {
    const host = context.switchToHttp();
    const response = host.getResponse<Response>();
    const type = context.getType();
    return stream$.handle().pipe(
      tap((data) => {
        if (isNull(data) || isUndefined(data)) {
          if (type === 'http') {
            response.status(204);
          }
        }
      }),
    );
  }
}
