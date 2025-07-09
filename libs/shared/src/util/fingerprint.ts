import { pick } from 'lodash';

export const fingerprint = function (this: any, next: any) {
  return next(null, {
    hostHeaders: pick(this.req.headers, ['host', 'user-agent', 'origin', 'referer', 'x-forwarded-for']),
  });
};
