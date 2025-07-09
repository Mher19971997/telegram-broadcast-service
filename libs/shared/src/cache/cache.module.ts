import { Global, Module } from '@nestjs/common';
import { CacheService } from '@telegram_broadcast_service/shared/src/cache/cache.service';
import { Redis } from '@telegram_broadcast_service/shared/src/cache/redis';

@Global()
@Module({
  providers: [CacheService, Redis],
  exports: [CacheService],
})
export class CacheModule {}
