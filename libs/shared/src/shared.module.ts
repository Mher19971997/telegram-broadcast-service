import { Module } from '@nestjs/common';
import { SharedService } from '@telegram_broadcast_service/shared/src/shared.service';

@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {}
