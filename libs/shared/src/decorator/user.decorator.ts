import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export namespace user {
  export const User = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const authorization = req.header('Authorization');
    return { ...req.user, authorization };
  });
  export const Platform = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return { ...req.fingerprint.components.useragent };
  });
  export const Bearer = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.header('Authorization');
  });
}
