import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InjectConnection } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import assert from 'assert';
import { OperationOptions } from '@telegram_broadcast_service/shared/src/sequelize/meta';

@Injectable()
export class ValidationService {
  constructor(@InjectConnection() private sequelize: Sequelize) {}

  async check(check: OperationOptions, payload: any) {
    await Promise.all([this.unique(check.unique, payload), this.exist(check.exist, payload), this.compere(check.compere, payload)]);
  }

  unique(unique: OperationOptions['unique'], payload: any) {
    return Promise.all(
      (unique || []).map(async (val) => {
        const model = this.sequelize.model(val.repo);
        if (payload[val.prop]) {
          const res = await model.count({
            where: { [val.prop]: payload[val.prop] },
          });
          assert(res === 0, `record_${val.repo}_with_prop_${val.prop}_exist`);
        }
        if (val.props instanceof Array && val.props.filter((prop) => payload[prop]).length === val.props.length) {
          const res = await model.count({
            where: val.props.reduce((acc, cV) => {
              acc = acc || {};
              acc[cV] = payload[cV];
              return acc;
            }, {} as any),
          });
          assert(res === 0, `record_${val.repo}_with_prop_${val.props.join('_')}_exist`);
        } else if (typeof val.props === 'object' && Object.keys(val.props)) {
          const res = await model.count({
            where: {
              [Op.or]: Object.keys(val.props).reduce((acc, cV) => {
                acc = acc || {};
                acc[cV] = payload[(val.props as any)[cV]];
                return acc;
              }, {} as any),
            },
          });
          assert(res === 0, `record_${val.repo}_with_prop_${Object.keys(val.props).join('_')}_exist`);
        }
      }),
    );
  }

  async exist(exist: OperationOptions['exist'], payload: any) {
    return Promise.all(
      (exist || []).map(async (val) => {
        if (!payload[val.foreign]) {
          return;
        }
        const model = this.sequelize.model(val.repo);
        const res = await model.count({
          where: { [val.local]: payload[val.foreign] },
        });
        assert(res !== 0, `record_${val.repo}_with_prop_${val.foreign}_not_exist`);
      }),
    );
  }

  async compere(compere: OperationOptions['compere'], payload: any) {
    return Promise.all(
      (compere || []).map(async (val) => {
        const model = this.sequelize.model(val.repo);
        const where = Object.keys(val.keys).reduce((acc, currentValue) => {
          if (payload[currentValue]) {
            if (!val.keys[`typeof${currentValue}`]) {
              acc[val.keys[currentValue]] = payload[currentValue];
            }
            if (val.keys[`typeof${currentValue}`] === 'array' && payload[currentValue]?.length) {
              acc[val.keys[currentValue]] = { [Op.in]: payload[currentValue] };
            }
          }

          return acc;
        }, {} as any);

        if (Object.keys(where).length === 0) {
          return;
        }

        const res = await model.count({ where });
        assert(res !== 0, `record_${val.repo}_with_prop_${Object.keys(val.keys).join('_')}_not_exist`);
      }),
    );
  }
}
