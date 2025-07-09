import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from '@telegram_broadcast_service/shared/src/sequelize/common-entity';
import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { JobStatus } from '@telegram_broadcast_service/service/src/model/broadcast-job/broadcast-job';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'CommonEntity',
  properties: {
    messageId: {
      type: 'string',
      format: 'uuid',
    },
    status: {
      type: 'string',
      enum: Object.values(JobStatus),
    },
    totalUsers: {
      type: 'integer',
      minimum: 0,
    },
    sentCount: {
      type: 'integer',
      minimum: 0,
    },
    failedCount: {
      type: 'integer',
      minimum: 0,
    },
    blockedCount: {
      type: 'integer',
      minimum: 0,
    },
    errors: {
      type: 'array',
    },
    progressPercent: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    startedAt: {
      type: 'string',
      format: 'date-time',
    },
    completedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
})
export class BroadcastJobEntity extends CommonEntity {
  @ApiProperty({ required: true })
  declare messageId?: string;

  @ApiProperty({ required: false, enum: JobStatus })
  declare status?: JobStatus;

  @ApiProperty({ required: false, default: 0 })
  declare totalUsers?: number;

  @ApiProperty({ required: false, default: 0 })
  declare sentCount?: number;

  @ApiProperty({ required: false, default: 0 })
  declare failedCount?: number;

  @ApiProperty({ required: false, default: 0 })
  declare blockedCount?: number;

  @ApiProperty({ required: false, type: [Object] })
  declare errors?: any[];

  @ApiProperty({ required: false, default: 0 })
  declare progressPercent?: number;

  @ApiProperty({ required: false })
  declare startedAt?: Date;

  @ApiProperty({ required: false })
  declare completedAt?: Date;
}