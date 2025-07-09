import { Injectable } from '@nestjs/common';
import { isUndefined, omit, omitBy } from 'lodash';
import { FindOptions } from 'sequelize/types/model';
import { FilterMeta, literalOptions, metaOptions, QueryMeta } from '@telegram_broadcast_service/shared/src/sequelize/meta';

@Injectable()
export class FilterService {
  protected metaOptions = metaOptions;
  protected literalOptions = literalOptions;
  calcPage(queryMeta?: QueryMeta): FindOptions {
    const order = Object.keys(queryMeta?.order || {}).map((value) => [...value.split('.'), (queryMeta.order as any)[value]]);
    const { page, limit } = this.makeMeta(queryMeta);

    return {
      ...((queryMeta?.paginate && {
        offset: Number(limit * (page - 1)),
        limit: limit,
      }) ||
        {}),
      order: order as any,
    };
  }

  makeMeta(queryMeta?: QueryMeta) {
    const page = Number((queryMeta?.page <= 0 && 1) || queryMeta?.page || 1);
    const limit = Number((queryMeta?.limit < 50 && queryMeta?.limit) || 50);
    return { page, limit };
  }

  filter<T>(filter: Partial<T & { filterMeta: FilterMeta }>): Partial<T & { filterMeta: FilterMeta }> {
    const filterMeta = this.makeFilterMeta(filter.filterMeta || {});
    return omitBy({ ...filter, ...filterMeta, filterMeta: undefined }, isUndefined) as Partial<T & { filterMeta: FilterMeta }>;
  }

  makeFilterMeta(filterMeta: FilterMeta) {
    for (const key in filterMeta) {
      if (this.metaOptions[key]) {
        filterMeta[this.metaOptions[key]] = this.filterTypeCast(filterMeta[key]);
        filterMeta = omit(filterMeta, [key]);
        if (typeof filterMeta[this.metaOptions[key]] !== 'object') {
          continue;
        }
      }
      if (this.literalOptions[key]) {
        filterMeta[key] = this.literalOptions[key](filterMeta[key]);
        continue;
      }

      if (typeof filterMeta[key] === 'object') {
        filterMeta[key] = this.makeFilterMeta(filterMeta[key]);
        continue;
      }
      if (typeof filterMeta[this.metaOptions[key]] === 'object') {
        filterMeta[this.metaOptions[key]] = this.makeFilterMeta(filterMeta[this.metaOptions[key]]);
        const schema = filterMeta[this.metaOptions[key]];
        for (const skey in schema) {
          if (typeof schema[skey] === 'object') {
            schema[skey] = this.makeFilterMeta(schema[skey]);
          }
        }
      }
    }
    return filterMeta;
  }

  filterTypeCast(val: any) {
    if (typeof val === 'string' && val === 'null') {
      return null;
    }
    return val;
  }
}
