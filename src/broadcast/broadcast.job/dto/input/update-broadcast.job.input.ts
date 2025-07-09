import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { BroadcastJobEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.job/dto/output/broadcast.job.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'BroadcastJobEntity',
})
export class UpdateBroadcastJobInput extends BroadcastJobEntity {}

