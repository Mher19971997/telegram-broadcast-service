import * as cm from '@nestjs/core';
import assert from 'assert';
import ___ from 'lodash';
import { Model } from 'sequelize-typescript';
import s from 'sequelize';

import { CommonModel } from '@telegram_broadcast_service/shared/src/sequelize/common-model';
import {
  CommonConstructorEntity,
  CommonContentEntity,
  CommonEntity,
  CommonOrderEntity,
  CommonRelationEntity,
} from '@telegram_broadcast_service/shared/src/sequelize/common-entity';
import { FilterInput, IncludeOptions, ListResult, ProcessingResult, UUID } from '@telegram_broadcast_service/shared/src/sequelize/meta';
import { FilterService } from '@telegram_broadcast_service/shared/src/sequelize/filter.service';
import { Util } from '@telegram_broadcast_service/shared/src/util/util';
// import { cache } from '@telegram_broadcast_service/shared/src/decorator/cache.decorator';
import { l10n } from '@telegram_broadcast_service/shared/src/config/l10n-constants';
import { decorator } from '@telegram_broadcast_service/shared/src/decorator';

export class CommonService<
  M extends Model,
  C extends CommonEntity,
  F extends CommonEntity & FilterInput,
  U extends CommonEntity,
  E extends CommonEntity,
  SM = Model,
> {
  private readonly ref?: cm.ModuleRef;
  private readonly conn: s.Sequelize;
  private readonly model: typeof CommonModel<M>;
  private readonly sequenceModel: typeof CommonModel<SM>;
  private readonly paginate: FilterService;
  // private readonly cacheKeys: string[];

  constructor(entities: CommonConstructorEntity<M, SM>) {
    this.ref = entities.moduleRef;
    this.conn = entities.connection;
    this.model = entities.model;
    this.sequenceModel = entities.sequenceModel;
    this.paginate = entities.paginateService;
    // this.cacheKeys = entities.cacheKeys || [];
  }

  // @cache.Purge()
  async create(inputDto: C, userOrTxn?: s.Transaction, txn?: s.Transaction): Promise<E | null> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const res = await this.model.create(___.omit(inputDto, ['include']) as any, {
      transaction,
      ...___.pick(inputDto, ['include']),
      hooks: true,
    });

    return this.findOne(<F>{ uuid: res.uuid }, transaction);
  }

  async findAll(filter: F, userOrTxn?: s.Transaction, txn?: s.Transaction): Promise<ListResult<E>> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const { queryMeta } = ___.omitBy<F>(filter, ___.isNull);
    const pMeta = this.paginate.makeMeta(queryMeta);
    const model = (filter?.queryMeta?.scopes && this.model.scope(filter?.queryMeta.scopes)) || this.model;
    const options = this.makeOptions(filter, transaction);
    const [count, res] = await Promise.all([
      queryMeta?.paginate && model.count(___.omit(options, ['include'])),
      model.findAll(___.omit(options, [])),
    ]);

    return { ...(((queryMeta?.paginate && { meta: { ...pMeta, count } }) || {}) as any), data: ___.map(res, Util.toJSON) };
  }

  async findOne(filter: F, userOrTxn?: s.Transaction, txn?: s.Transaction): Promise<E | null> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const model = (filter?.scopes && this.model.scope(filter.scopes)) || this.model;
    const options = this.makeOptions(filter, transaction);
    options.limit = 1;
    return Util.toJSON(await model.findOne(options));
  }

  // @cache.Purge()
  async update(filter: F, inputDto: U, userOrTxn?: s.Transaction, txn?: s.Transaction): Promise<E | null> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    await this.model.update(
      ___.omit(inputDto, ['include']) as any,
      { where: filter, transaction, ...___.pick(inputDto, ['include']), hooks: true } as any,
    );

    return this.findOne(filter, transaction);
  }

  // @cache.Purge()
  async upsert(filter: F, inputDto: C | U, userOrTxn?: s.Transaction, txn?: s.Transaction): Promise<E | null> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const res = await this.findOne(filter, transaction);
    if (res) {
      return this.update(<F>{ uuid: res.uuid }, <U>inputDto, transaction);
    }
    return this.create(<C>inputDto, transaction);
  }

  // @cache.Purge()
  async remove(filter: F, userOrTxn?: s.Transaction, txn?: s.Transaction): Promise<E | null> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const res = await this.findOne(filter, transaction);
    if (!res) {
      return null;
    }

    await this.model.destroy({
      where: ___.omit(filter, ['include']),
      force: true,
      transaction,
      cascade: true,
      ...___.pick(filter, ['include']),
    } as any);
    return res;
  }

  @decorator.sequelize.Transaction({ afterCommit: true })
  // @cache.Purge()
  async order(
    mineFilter: F,
    lastFilter: F,
    inputDto: { order: CommonOrderEntity[] },
    userOrTxn?: s.Transaction,
    txn?: s.Transaction,
  ): Promise<ProcessingResult> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const uuids = inputDto.order.map((val: { uuid: UUID }) => val.uuid);
    const res = await this.findAll(
      { ...lastFilter, filterMeta: { uuid: { in: uuids } }, queryMeta: { order: { sequence: 'asc' } } },
      transaction,
    );
    assert(res.data.length === inputDto.order.length, l10n.wrong_uuids);

    await Promise.all(
      inputDto.order.map((order: { uuid: UUID; sequence: number }) =>
        this.update(<F>{ uuid: order.uuid }, { sequence: order.sequence } as any, transaction),
      ),
    );
    return { processing: true };
  }

  @decorator.sequelize.Transaction({ afterCommit: true })
  // @decorator.cache.Purge()
  async contentOrder(
    filter: F,
    inputDto: { order: E[] },
    orderingFields: { sourceKey: string; foreignKey: string; repo: string }[],
    userOrTxn?: s.Transaction,
    txn?: s.Transaction,
  ): Promise<ProcessingResult> {
    const transaction = <s.Transaction>(txn || userOrTxn);
    const res = await Promise.all(
      inputDto.order.flatMap((order) => {
        const pair = orderingFields.find((pVal) => Object.keys(order).includes(pVal.foreignKey));
        const model = this.model.associations[pair.repo];
        const where: any = { ...filter, [pair.sourceKey]: order[pair.foreignKey] };
        return ((model as any).through?.model || model.target).findOne({ where, transaction });
      }),
    );
    assert(res.length === inputDto.order.length, l10n.wrong_uuids);

    await Promise.all(
      inputDto.order.flatMap((order) => {
        const pair = orderingFields.find((pVal) => Object.keys(order).includes(pVal.foreignKey));
        const where: any = { ...filter, [pair.sourceKey]: order[pair.foreignKey] };
        const model = this.model.associations[pair.repo];
        return ((model as any).through?.model || model.target).update({ sequence: order.sequence }, { where, transaction });
      }),
    );
    return { processing: true };
  }

  @decorator.sequelize.Transaction({ afterCommit: true })
  // @decorator.cache.Purge()
  async processContent(
    sourceProp: UUID,
    inputDto: CommonContentEntity,
    service: any,
    userOrTxn?: s.Transaction,
    txn?: s.Transaction,
  ) {
    const transaction = <s.Transaction>(txn || userOrTxn);
    inputDto.remove && (await Promise.all(inputDto.remove.map(async (sUuid) => service.remove({ uuid: sUuid } as any, transaction))));
    inputDto.add &&
      (await Promise.all(
        inputDto.add.map((val) => service.create({ ...val, [inputDto.sourceProp]: sourceProp, sequence: val.sequence }, transaction)),
      ));
    inputDto.update &&
      (await Promise.all(
        inputDto.update.map((val) =>
          service.update({ ...(inputDto.otherProps || {}), [inputDto.sourceProp]: sourceProp, uuid: val.uuid } as any, val, transaction),
        ),
      ));
    inputDto.removeBaseRel && (await service.remove({ [inputDto.sourceProp]: sourceProp } as any, transaction));
  }

  @decorator.sequelize.Transaction({ afterCommit: true })
  // @decorator.cache.Purge()
  async processRel(
    sourceProp: UUID,
    inputDto: CommonRelationEntity,
    relModel: any,
    userOrTxn?: s.Transaction,
    txn?: s.Transaction,
  ) {
    const transaction = <s.Transaction>(txn || userOrTxn);
    inputDto.remove &&
      (await Promise.all(
        inputDto.remove.map(async (foreignUuid) =>
          relModel.destroy({
            where: { ...(inputDto.otherProps || {}), [inputDto.sourceProp]: sourceProp, [inputDto.foreignProp]: foreignUuid } as any,
            transaction,
          }),
        ),
      ));
    inputDto.add &&
      (await Promise.all(
        inputDto.add.map(async (val) =>
          relModel.create(
            { ...(inputDto.otherProps || {}), [inputDto.sourceProp]: sourceProp, [inputDto.foreignProp]: val.uuid, sequence: val.sequence },
            { transaction },
          ),
        ),
      ));
    inputDto.removeBaseRel && (await relModel.destroy({ where: { [inputDto.sourceProp]: sourceProp } as any, transaction }));
  }

  private makeOptions(filter: F, transaction?: s.Transaction) {
    const { queryMeta, filterMeta, attributeMeta, includeMeta, ...filters } = ___.omitBy<F>(filter, ___.isNull);
    const pFilter = this.paginate.calcPage(queryMeta);
    const pInclude = this.makeIncludeOptions(___.filter(includeMeta, (val) => val));
    return {
      where: this.paginate.filter<F>({ ...filters, filterMeta } as any),
      ...___.omit(pFilter, ['scopes']),
      include: pInclude,
      attributes: attributeMeta,
      transaction,
    };
  }

  private makeIncludeOptions(includeMeta: F['includeMeta']) {
    return (includeMeta || []).map((val: IncludeOptions) => {
      val.where && (val.where = this.paginate.filter<F>({ filterMeta: val.where } as any));
      val.on && (val.on = this.paginate.filter<F>({ filterMeta: val.on } as any) as any);
      val.include = this.makeIncludeOptions(___.filter<any[]>(val.include, (val) => val));
      return val;
    });
  }
}
