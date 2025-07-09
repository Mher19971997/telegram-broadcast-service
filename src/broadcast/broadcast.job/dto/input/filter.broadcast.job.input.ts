import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { FilterInput } from '@telegram_broadcast_service/shared/src/sequelize/meta';
import { Util } from '@telegram_broadcast_service/shared/src/util/util';
import { BroadcastJobEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.job/dto/output/broadcast.job.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'BroadcastJobEntity',
})
export class FilterBroadcastJobInput extends Util.mixin<BroadcastJobEntity, FilterInput>(BroadcastJobEntity, FilterInput) {}
