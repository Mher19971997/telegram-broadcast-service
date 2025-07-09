import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from '@telegram_broadcast_service/shared/src/sequelize/common-entity';
import { decorator } from '@telegram_broadcast_service/shared/src/decorator';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'CommonEntity',
  properties: {
    telegramId: {
      type: 'string',
      minLength: 1,
      maxLength: 20,
    },
    username: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    isActive: {
      type: 'boolean',
    },
    isBlocked: {
      type: 'boolean',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    language: {
      type: 'string',
      minLength: 2,
      maxLength: 5,
    },
    phone: {
      type: 'string',
      phoneNumber: true,
    },
    email: {
      type: 'string',
      format: 'email',
    },
  },
})
export class TelegramSubscriberEntity extends CommonEntity {
  @ApiProperty({ required: true })
  declare telegramId?: string;

  @ApiProperty({ required: false })
  declare username?: string;

  @ApiProperty({ required: false })
  declare firstName?: string;

  @ApiProperty({ required: false })
  declare lastName?: string;

  @ApiProperty({ required: false, default: true })
  declare isActive?: boolean;

  @ApiProperty({ required: false, default: false })
  declare isBlocked?: boolean;

  @ApiProperty({ required: false, type: [String] })
  declare tags?: string[];

  @ApiProperty({ required: false })
  declare language?: string;

  @ApiProperty({ required: false })
  declare phone?: string;

  @ApiProperty({ required: false })
  declare email?: string;
}