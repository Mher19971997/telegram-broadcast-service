import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { FilterInput } from '@telegram_broadcast_service/shared/src/sequelize/meta';
import { Util } from '@telegram_broadcast_service/shared/src/util/util';
import { BroadcastMessageEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.message/dto/output/broadcast.message.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'BroadcastMessageEntity',
})
export class FilterBroadcastMessageInput extends Util.mixin<BroadcastMessageEntity, FilterInput>(BroadcastMessageEntity, FilterInput) {}
