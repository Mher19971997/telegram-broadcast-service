import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { TelegramSubscriberEntity } from '@telegram_broadcast_service/src/telegram/subscriber/dto/output/telegram.subscriber.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'TelegramSubscriberEntity',
})
export class UpdateTelegramSubscriberInput extends TelegramSubscriberEntity {}

