import { applyDecorators, Inject, Logger } from '@nestjs/common';
import { json5 } from '@telegram_broadcast_service/shared/src/util/parser/json5';
import { isUndefined, omitBy } from 'lodash';
import { CacheService } from '@telegram_broadcast_service/shared/src/cache/cache.service';

export namespace cache {
  export const Store = (opt: { ttl: number }) => {
    const injectCacheService = Inject(CacheService);

    return applyDecorators((target: any, propertyKey, descriptor) => {
      const original = descriptor.value;
      injectCacheService(target, 'cacheService');
      const cacheKeyPref = [
        target.constructor.name,
        propertyKey,
        target[propertyKey].toString().replace(/ /gu, '').replace(/\r\n/gu, '').split(')')[0],
        ')',
      ].join('.');

      if (typeof original === 'function') {
        descriptor.value = async function (this: any, ...args: any[]) {
          const cacheService = this.cacheService as CacheService;
          const logger = this.logger as Logger;
          const cacheKey = `${cacheKeyPref}.${json5.stringify(omitBy(args, isUndefined))}`;
          const cacheVal = await cacheService.get(cacheKey);
          if (cacheVal) {
            return cacheVal;
          }
          const res = await original.apply(this, args);
          if (cacheKey && res) {
            await cacheService.set(cacheKey, res, { EX: (opt.ttl || 0) / 1000 });
            logger && logger.debug('cache-store', cacheKeyPref);
          }
          return res;
        } as any;
      }
      return descriptor;
    });
  };

  export const Purge = (cKeys?: string[]) => {
    const injectCacheService = Inject(CacheService);
    return applyDecorators((target: any, _propertyKey: string | symbol, descriptor) => {
      const original = descriptor.value;
      injectCacheService(target, 'cacheService');

      if (typeof original === 'function') {
        descriptor.value = async function (this: any, ...args: any[]) {
          const cacheService = this.cacheService as CacheService;
          const cacheKey = this.constructor.name;

          if (cacheService) {
            const baseKeys = (await cacheService.scan(cacheKey)) || [];
            const customKeys = (await Promise.all((cKeys || []).map(async (val: string) => (await cacheService.scan(val)) || []))).flatMap(
              (val) => val,
            );
            const relatedKeys = (
              await Promise.all((this.cacheKeys || []).map(async (val: string) => (await cacheService.scan(val)) || []))
            ).flatMap((val) => val);

            const tKeys = [...baseKeys, ...customKeys, ...relatedKeys];
            await Promise.all(tKeys.map((key) => cacheService.del(key)));
          }
          return original.apply(this, args);
        } as any;
      }
    });
  };
}
