import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@telegram_broadcast_service/service/src/model/broadcast_messages/broadcast_message';
import { decorator } from '@telegram_broadcast_service/shared/src/decorator';

@decorator.ajv.Schema({
  type: 'object',
  required: ['title', 'content'],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
    },
    content: {
      type: 'string',
      minLength: 1,
      maxLength: 4096,
    },
    type: {
      type: 'string',
      enum: Object.values(MessageType),
    },
    media: {
      type: 'object',
    },
    keyboard: {
      type: 'object',
    },
    targetTags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    isScheduled: {
      type: 'boolean',
    },
    scheduledAt: {
      type: 'string',
      format: 'date-time',
    },
  },
})
export class CreateBroadcastMessageInput {
  @ApiProperty({ required: true })
  declare title: string;

  @ApiProperty({ required: true })
  declare content: string;

  @ApiProperty({ required: false, enum: MessageType, default: MessageType.TEXT })
  declare type?: MessageType;

  @ApiProperty({ required: false })
  declare media?: any;

  @ApiProperty({ required: false })
  declare keyboard?: any;

  @ApiProperty({ required: false, type: [String] })
  declare targetTags?: string[];

  @ApiProperty({ required: false, default: false })
  declare isScheduled?: boolean;

  @ApiProperty({ required: false })
  declare scheduledAt?: Date;
}