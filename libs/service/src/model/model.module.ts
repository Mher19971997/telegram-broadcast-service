import { DynamicModule, Module } from '@nestjs/common';
import { TelegramSubscriberEntry } from '@telegram_broadcast_service/service/src/model/telegram_subscriber/telegram_subscriber';
import { BroadcastJobEntry } from '@telegram_broadcast_service/service/src/model//broadcast-job/broadcast-job';
import { BroadcastMessageEntry } from '@telegram_broadcast_service/service/src/model//broadcast_messages/broadcast_message';

const models: DynamicModule[] = [
  TelegramSubscriberEntry,
  BroadcastJobEntry,
  BroadcastMessageEntry
];

@Module({
  imports: models,
  exports: models
})
export class ModelModule {}
