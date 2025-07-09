import { ArgumentMetadata, Injectable, Inject, PipeTransform, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { map, omit } from 'lodash';
import { UnprocessableEntityException } from '@nestjs/common/exceptions/unprocessable-entity.exception';
import { hasSchema, validateSchema } from '@telegram_broadcast_service/shared/src/util/ajv/ajv.lib';
import { Logger } from '@telegram_broadcast_service/shared/src/util/logger';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(@Inject() protected logger: Logger) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = omit(plainToInstance(metatype, value.data || value), 'noCache');

    if (hasSchema(metatype.name)) {
      this.logger.debug({ payload: { schema: metatype.name, object } }, null, { pipe: 'ajvValidate' });
      return this.ajvValidate(metatype, object);
    }

    this.logger.debug({ payload: object }, null, { pipe: 'classValidate' });
    return this.classValidate(metatype, object);
  }

  private toValidate(metatype: Type<any>): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }

  private async classValidate(_metatype: any, object: object) {
    const errors = await validate(object);
    if (errors.length > 0) {
      this.logger.error(
        map(errors, (value) => value),
        null,
        null,
        { pipe: 'classValidate' },
      );
      throw new UnprocessableEntityException(map(errors, (value) => value));
    }
    return object;
  }

  private async ajvValidate(metatype: { name: string }, object: any) {
    const { data, error } = await validateSchema(metatype.name, object);
    if (error?.errors?.length > 0) {
      this.logger.error(
        map(error.errors, (value) => value),
        null,
        null,
        { pipe: 'ajvValidate' },
      );
      throw new UnprocessableEntityException(map(error.errors, (value) => value));
    }
    return data;
  }
}
