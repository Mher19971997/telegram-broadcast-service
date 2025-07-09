import { ApiProperty } from '@nestjs/swagger';
import s from 'sequelize';
// @ts-ignore
import * as qs from 'sequelize/lib/sql-string';
import { IncludeOptions as BaseIncludeOptions } from 'sequelize/types/model';
import { ajv } from '@telegram_broadcast_service/shared/src/decorator/ajv.decorator';

export const literalOptions: FilterMeta = {
  literal: s.literal,
  tsQuery: (val: { [key: string]: string }) =>
    (Object.keys(val)[0] &&
      s.literal(
        `"${Object.keys(val)[0]}" @@ to_tsquery(${qs.escape(Object.values(val)[0].replace(new RegExp(' ', 'g'), '&'), null, 'postgres')})`,
      )) ||
    null,
  websearchQuery: (val: { [key: string]: string }) =>
    (Object.keys(val)[0] &&
      s.literal(`"${Object.keys(val)[0]}" @@ websearch_to_tsquery(${qs.escape(Object.values(val)[0], null, 'postgres')})`)) ||
    null,
  fn: s.fn,
  col: s.col,
  cast: s.cast,
};
export const metaOptions: FilterMeta = {
  adjacent: s.Op.adjacent,
  all: s.Op.all,
  and: s.Op.and,
  any: s.Op.any,
  between: s.Op.between,
  col: s.Op.col,
  contained: s.Op.contained,
  contains: s.Op.contains,
  endsWith: s.Op.endsWith,
  eq: s.Op.eq,
  gt: s.Op.gt,
  gte: s.Op.gte,
  iLike: s.Op.iLike,
  in: s.Op.in,
  iRegexp: s.Op.iRegexp,
  is: s.Op.is,
  like: s.Op.like,
  lt: s.Op.lt,
  lte: s.Op.lte,
  match: s.Op.match,
  ne: s.Op.ne,
  noExtendLeft: s.Op.noExtendLeft,
  noExtendRight: s.Op.noExtendRight,
  not: s.Op.not,
  notBetween: s.Op.notBetween,
  notILike: s.Op.notILike,
  notIn: s.Op.notIn,
  notIRegexp: s.Op.notIRegexp,
  notLike: s.Op.notLike,
  notRegexp: s.Op.notRegexp,
  or: s.Op.or,
  overlap: s.Op.overlap,
  placeholder: s.Op.placeholder,
  regexp: s.Op.regexp,
  startsWith: s.Op.startsWith,
  strictLeft: s.Op.strictLeft,
  strictRight: s.Op.strictRight,
  substring: s.Op.substring,
  values: s.Op.values,
};

export class FilterMeta {
  [key: string | symbol]: any;
}

export type UUID = string;

@ajv.Schema({
  type: 'object',
  properties: {
    limit: {
      type: 'string',
    },
    page: {
      type: 'string',
    },
    paginate: {
      type: 'boolean',
      default: true,
    },
    order: {
      type: 'object',
    },
  },
  default: {},
})
export class QueryMeta {
  @ApiProperty({ required: false })
  declare limit?: number;
  @ApiProperty({ required: false })
  declare page?: number;
  @ApiProperty({ required: false })
  declare paginate?: boolean;
  @ApiProperty({ required: false })
  declare scopes?: string[];
  @ApiProperty({ required: false })
  declare order?: FilterMeta;
}

export interface IncludeOptions extends BaseIncludeOptions {
  repo: string;
  type: 'hasOne' | 'hasMeny';
  sourceKey: string;
  foreignKey: string;
  include?: IncludeOptions[];
}

@ajv.Schema({
  type: 'object',
  properties: {
    filterMeta: {
      type: 'object',
    },
    optionsMeta: {
      type: 'object',
    },
    queryMeta: {
      $ref: 'QueryMeta',
    },
    attributeMeta: {
      type: 'object',
    },
    includeMeta: {
      type: 'array',
    },
    noCache: {
      type: 'boolean',
    },
    format: {
      type: 'string',
      enum: ['html', 'xml', 'json', 'json5'],
    },
  },
})
export class FilterInput {
  @ApiProperty({
    required: false,
    readOnly: true,
    type: 'object',
  })
  declare filterMeta?: FilterMeta;

  @ApiProperty({
    required: false,
    readOnly: true,
    type: 'object',
  })
  declare optionsMeta?: s.FindOptions | s.NonNullFindOptions;

  @ApiProperty({
    required: false,
    readOnly: true,
    type: 'object',
  })
  declare queryMeta?: QueryMeta;

  @ApiProperty({
    required: false,
    readOnly: true,
    type: 'object',
  })
  declare attributeMeta?: s.FindAttributeOptions | any;

  @ApiProperty({
    required: false,
    readOnly: true,
    isArray: true,
    type: 'array',
  })
  declare includeMeta?: s.Includeable[];

  @ApiProperty({ required: false, enum: ['html', 'xml', 'json', 'json5'] })
  declare format?: string;
}

export class ListResult<E> {
  declare meta: { page: number; limit: number; count: number };
  declare data: E[];
}

export class ProcessingResult {
  declare processing: boolean;
}

export interface OperationOptions {
  unique?: { repo: string; prop?: string; props?: string[] | { [key: string]: string } }[];
  exist?: {
    repo: string;
    local: string;
    foreign: string;
  }[];
  compere?: {
    repo: string;
    keys: { [key: string]: string };
  }[];
}
