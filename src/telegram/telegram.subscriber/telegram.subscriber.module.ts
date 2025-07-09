import { Module } from '@nestjs/common';
import { TelegramSubscriberService } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.service';

@Module({
  providers: [TelegramSubscriberService],
  exports: [TelegramSubscriberService]
})
export class TelegramSubscriberModule { }