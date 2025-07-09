import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { BroadcastMessageEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.message/dto/output/broadcast.message.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'BroadcastMessageEntity',
})
export class UpdateBroadcastMessageInput extends BroadcastMessageEntity {}

