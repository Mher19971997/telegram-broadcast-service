import { AnySchema } from 'ajv';
import { applyDecorators } from '@nestjs/common';
import { ajvLib } from '@telegram_broadcast_service/shared/src/util/ajv/ajv.lib';

export namespace ajv {
  export const Schema = (schema: AnySchema | AnySchema[]) => {
    return applyDecorators((target: any) => {
      ajvLib.addSchema({ $id: target.name, $async: true, ...(schema as any) }, target.name);
    });
  };
}
