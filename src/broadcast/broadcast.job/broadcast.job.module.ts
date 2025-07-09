import { Module } from '@nestjs/common';
import { BroadcastJobService } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.service';

@Module({
  providers: [BroadcastJobService],
  exports: [BroadcastJobService]
})
export class BroadcastJobModule { }