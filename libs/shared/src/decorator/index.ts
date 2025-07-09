import { ajv as _ajv } from './ajv.decorator';
import { user as _user } from './user.decorator';
import { cache as _cache } from './cache.decorator';
import { sequelize as _sequelize } from './sequelize.decorator';
import { mixin as _mixin } from './mixin.decorator';

export namespace decorator {
  export import ajv = _ajv;
  export import user = _user;
  export import cache = _cache;
  export import sequelize = _sequelize;
  export import mixin = _mixin;
}
