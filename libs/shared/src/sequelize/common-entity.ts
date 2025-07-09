import * as cm from '@nestjs/core';
import s from 'sequelize';
import { ApiProperty } from '@nestjs/swagger';
import { CommonModel } from '@telegram_broadcast_service/shared/src/sequelize/common-model';
import { FilterService } from '@telegram_broadcast_service/shared/src/sequelize/filter.service';
import { decorator } from '@telegram_broadcast_service/shared/src/decorator';
import { UUID } from '@telegram_broadcast_service/shared/src/sequelize/meta';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'FilterInput',
  properties: {
    uuid: {
      type: 'string',
      format: 'uuid',
    },
    createdAt: {
      type: 'string',
      format: 'date',
    },
    updatedAt: {
      type: 'string',
      format: 'date',
    },
    deletedAt: {
      type: 'string',
      format: 'date',
    },
  },
})
export class CommonEntity {
  @ApiProperty({ required: false, readOnly: true, type: 'string' })
  declare uuid?: UUID;
  @ApiProperty({ required: false, readOnly: true })
  declare createdAt?: Date;
  @ApiProperty({ required: false, readOnly: true })
  declare updatedAt?: Date;
  @ApiProperty({ required: false, readOnly: true })
  declare deletedAt?: Date;
  [key: string]: any;
}

@decorator.ajv.Schema({
  type: 'object',
  properties: {
    uuid: {
      type: 'string',
      format: 'uuid',
    },
    sequence: {
      type: 'number',
    },
  },
  required: ['uuid', 'sequence'],
})
export class CommonOrderEntity {
  @ApiProperty({ required: true })
  declare uuid?: UUID;
  @ApiProperty({ required: true })
  declare sequence?: number;
}

@decorator.ajv.Schema({
  type: 'object',
  properties: {
    add: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
    remove: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
    removeBaseRel: {
      type: 'boolean',
    },
  },
})
export class CommonRelationEntity {
  @ApiProperty({ required: false })
  declare add?: any[];
  @ApiProperty({ required: false })
  declare remove?: UUID[];
  @ApiProperty({ required: false })
  declare removeBaseRel?: boolean;

  @ApiProperty({ required: false })
  declare sourceProp?: UUID;
  @ApiProperty({ required: false })
  declare foreignProp?: UUID;
  @ApiProperty({ required: false })
  declare otherProps?: { [key: string]: UUID };
}

@decorator.ajv.Schema({
  type: 'object',
  properties: {
    add: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
    remove: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
    removeBaseRel: {
      type: 'boolean',
    },
  },
})
export class CommonContentEntity {
  @ApiProperty({ required: false })
  declare add?: any[];
  @ApiProperty({ required: false })
  declare update?: any[];
  @ApiProperty({ required: false })
  declare remove?: UUID[];
  @ApiProperty({ required: false })
  declare removeBaseRel?: boolean;

  @ApiProperty({ required: false })
  declare sourceProp?: UUID;
  @ApiProperty({ required: false })
  declare foreignProp?: UUID;
  @ApiProperty({ required: false })
  declare otherProps?: { [key: string]: UUID };
}

export class CommonConstructorEntity<M, SM> {
  connection?: s.Sequelize;
  moduleRef?: cm.ModuleRef;
  model: typeof CommonModel<M> | any;
  paginateService: FilterService;
  cacheKeys?: string[];
  sequenceModel?: typeof CommonModel<SM> | any;
}
