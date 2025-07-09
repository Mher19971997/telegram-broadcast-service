import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ValidationError } from 'sequelize';
import { Response, Request } from 'express';
import { isNull, omitBy, pick } from 'lodash';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Logger } from '@telegram_broadcast_service/shared/src/util/logger';

@Catch()
export class AllExceptionsFilter  implements ExceptionFilter<HttpException> {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ExecutionContextHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const type = host.getType();

    this.handleHttpException(type, exception, host, response, request);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  handleHttpException(type: string, exception: any, host: ExecutionContextHost, response: Response, request: Request) {
    if (type === 'http') {
      if (!exception) {
        response.status(500).json({
          name: InternalServerErrorException,
          message: 'InternalUnknownErrorException',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return;
      }
      const lException = exception as Error | any;
      const statusCode = lException.statusCode || 400;
      let resp: any = {};

      if (typeof lException === 'string') {
        const sError = new Error(lException);
        resp.statusCode = statusCode;
        resp.name = sError.name;
        resp.message = sError.message;
      } else if (lException?.name?.includes('Sequelize')) {
        const hException = exception as ValidationError;
        resp.statusCode = 418;
        resp.name = (hException.errors && 'ExpectationFailedException') || 'QueryFailedException';
        resp.message =
          hException.errors?.map((value) => pick(value, ['message', 'value', 'validatorKey', 'type', 'path'])) || hException.message;
      } else if (lException?.message?.includes('connect ECONNREFUSED') || lException?.name?.includes('AxiosError')) {
        resp.statusCode = 408;
        resp.name = lException.name;
        resp.message = `Service unavailable: ${lException.message}`;
      } else if (lException.name?.includes('Error') || lException.status === 'error') {
        resp.statusCode = 400;
        resp.name = 'ExpectationFailedException';
        resp.message = lException.message;
      } else if (Boolean(lException.cause)) {
        resp.statusCode = lException.cause.code;
        resp.name = 'BAD_REQUEST';
        resp.message = lException.cause.message;
      } else if (lException?.name?.includes('Exception')) {
        const hException = exception as HttpException;
        resp.statusCode = hException.getStatus();
        resp.name = hException.name;
        resp.message = hException.message;
        resp = { ...resp, ...(hException.getResponse() as any) };
      } else {
        resp = { ...resp, ...lException };
      }

      this.logger.error(
        {
          request: host.getType(),
          lException: omitBy(
            [lException.name, lException.messages, lException.errors, lException.stack?.replace(/ {4}/gm, '').split('\n')],
            isNull,
          ),
          rException: resp,
        },
        null,
        null,
        { filter: 'AllExceptionsFilter', request: type },
      );
      response.status(statusCode).json({
        ...resp,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
