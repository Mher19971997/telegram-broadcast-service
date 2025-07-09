import { Inject, applyDecorators } from '@nestjs/common';
import { filter, isUndefined } from 'lodash';
import { TransactionOptions } from 'sequelize/types/transaction';
import { Transaction as CommonTransaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ValidationService } from '@telegram_broadcast_service/shared/src/sequelize/validation.service';
import { OperationOptions } from '@telegram_broadcast_service/shared/src/sequelize/meta';

export namespace sequelize {
  export const Transaction = (options?: TransactionOptions & { afterCommit?: boolean }) => {
    const injectSequelize = Inject(Sequelize);
    !options && (options = {});
    !('afterCommit' in options) && (options.afterCommit = false);
    return applyDecorators((target, _propertyKey, descriptor) => {
      const original = descriptor.value;
      injectSequelize(target, 'sequelize');

      if (typeof original === 'function') {
        descriptor.value = async function (this: any, ...args: any[]) {
          let exTransaction;
          if (args[args.length - 1] instanceof CommonTransaction) {
            exTransaction = args[args.length - 1];
            args.splice(args.length - 1, 1);
          }

          const seqInstance = this.sequelize as Sequelize;
          const transaction = await seqInstance.transaction({
            transaction: exTransaction,
            autocommit: false,
            type: CommonTransaction.TYPES.IMMEDIATE,
            isolationLevel: CommonTransaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
            ...options,
          });

          try {
            const res = await original.apply(this, [...filter(args, (val) => !isUndefined(val)), transaction]);
            options.afterCommit === true && (await transaction.commit());
            return res;
          } catch (err) {
            console.log(err);
            await transaction.rollback();
            throw err;
          }
        } as any;
      }
    });
  };

  export const Operation = (options?: OperationOptions) => {
    const injectSequelize = Inject(Sequelize);
    const injectValidationService = Inject(ValidationService);
    return applyDecorators((target, propertyKey, descriptor) => {
      const original = descriptor.value;
      injectSequelize(target, 'sequelize');
      injectValidationService(target, 'validationService');

      if (typeof original === 'function') {
        descriptor.value = async function (this: any, ...args: any[]) {
          const validation = this.validationService as ValidationService;
          const payload =
            ((propertyKey.toString().includes('create') ||
              propertyKey.toString().includes('upsert') ||
              propertyKey.toString().includes('find')) &&
              args[0]) ||
            (propertyKey.toString().includes('update') && args[1]) ||
            (propertyKey.toString().includes('Rel') && {
              ...args[0],
              ...args[1],
            });
          payload && (await validation.check(options, payload));
          return original.apply(this, args);
        } as any;
      }
    });
  };
}
