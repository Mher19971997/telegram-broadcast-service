import { Type } from '@nestjs/common';
import { Model } from 'sequelize-typescript';
import moment from 'moment';
import { Observable } from 'rxjs';
import { omit } from 'lodash';
import { Promise } from '@telegram_broadcast_service/shared/src/util/promise';

export class Util {
  static toJSON(val?: Model) {
    return val?.toJSON() || null;
  }

  static calcLastTime(date: string | Date, after = 60) {
    const last = moment().utc().unix() - moment(date).utc().unix();
    if (last < after) {
      return after - last;
    }
  }

  static toPromise<T>(result: Observable<T>): Promise<T> {
    return Promise.retry(
      () =>
        new Promise<T>((resolve, reject) =>
          result.subscribe({
            next: (val): void => resolve(val),
            error: (err: any): void => reject(err),
          }),
        ),
      3,
    );
  }

  static mixin<C1, C2>(derivedCtor: any, baseCtor: any): Type<C1> & Type<C2> {
    if (!derivedCtor && !baseCtor) {
      throw new Error('derivedCtor and baseCtor are required');
    }
    if (baseCtor) {
      Object.getOwnPropertyNames((baseCtor as any).prototype).forEach((name) => {
        Object.defineProperty(
          (derivedCtor as any).prototype,
          name,
          Object.getOwnPropertyDescriptor((baseCtor as any).prototype, name) || Object.create(null),
        );
      });
    }
    return <Type<C1> & Type<C2>>(<unknown>derivedCtor);
  }

  static removeCircular(ref: any) {
    for (const key in ref) {
      if (ref[key] === ref || typeof ref[key] === 'function') {
        ref = omit(ref, [key]);
      } else if (typeof ref[key] === 'object') {
        this.removeCircular(ref[key]);
      }
    }
  }
}
