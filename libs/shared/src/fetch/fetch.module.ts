import { Global, Module } from '@nestjs/common';
import { HttpModule as BaseHttpModule } from '@nestjs/axios';
import { FetchService } from '@telegram_broadcast_service/shared/src/fetch/fetch.service';

@Global()
@Module({
  imports: [
    BaseHttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  providers: [FetchService],
  exports: [FetchService],
})
export class FetchModule {}
