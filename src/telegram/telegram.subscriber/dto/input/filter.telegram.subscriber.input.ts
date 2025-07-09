import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { FilterInput } from '@telegram_broadcast_service/shared/src/sequelize/meta';
import { Util } from '@telegram_broadcast_service/shared/src/util/util';
import { TelegramSubscriberEntity } from '@telegram_broadcast_service/src/telegram/subscriber/dto/output/telegram.subscriber.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'TelegramSubscriberEntity',
})
export class FilterTelegramSubscriberInput extends Util.mixin<TelegramSubscriberEntity, FilterInput>(TelegramSubscriberEntity, FilterInput) {}
