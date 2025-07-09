import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from '@telegram_broadcast_service/shared/src/sequelize/common-entity';
import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { MessageType } from '@telegram_broadcast_service/service/src/model/broadcast_messages/broadcast_message';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'CommonEntity',
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
    authorId: {
      type: 'string',
    },
  },
})
export class BroadcastMessageEntity extends CommonEntity {
  @ApiProperty({ required: true })
  declare title?: string;

  @ApiProperty({ required: true })
  declare content?: string;

  @ApiProperty({ required: false, enum: MessageType })
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

  @ApiProperty({ required: false })
  declare authorId?: string;
}