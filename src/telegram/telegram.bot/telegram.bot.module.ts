import { Module } from '@nestjs/common';
import { TelegramBotService } from '@telegram_broadcast_service/src/telegram/telegram.bot/telegram.bot.service';
import { TelegramSubscriberModule } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.module';

@Module({
  imports:[TelegramSubscriberModule],
  providers: [TelegramBotService],
  exports: [TelegramBotService]
})
export class TelegramBotModule { }
