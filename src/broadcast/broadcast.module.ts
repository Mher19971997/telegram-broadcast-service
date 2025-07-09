import { Module } from '@nestjs/common';
import { TelegramBroadcastController } from '@telegram_broadcast_service/src/broadcast/controllers/telegram-broadcast.controller';
import { BroadcastJobModule } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.module';
import { TelegramBotModule } from '@telegram_broadcast_service/src/telegram/telegram.bot/telegram.bot.module';
import { BroadcastProcessor } from '@telegram_broadcast_service/src/broadcast/processors/broadcast.processor';
import { BroadcastMessageModule } from '@telegram_broadcast_service/src/broadcast/broadcast.message/broadcast.message.module';
import { TelegramSubscriberModule } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.module';

@Module({
  imports: [
    BroadcastJobModule,
    TelegramBotModule,
    BroadcastMessageModule,
    TelegramSubscriberModule
  ],
  controllers: [TelegramBroadcastController],
  providers: [BroadcastProcessor],
})
export class BroadcastModule { }
