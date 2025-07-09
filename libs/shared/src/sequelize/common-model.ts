import * as st from 'sequelize-typescript';
import { literal } from 'sequelize';

import { ThroughModel } from '@telegram_broadcast_service/shared/src/sequelize/through-model';
import { CommonEntity } from '@telegram_broadcast_service/shared/src/sequelize/common-entity';
import { UUID } from '@telegram_broadcast_service/shared/src/sequelize/meta';

export class CommonModel<M> extends ThroughModel<M & CommonEntity> {
  @st.Column({
    type: st.DataType.UUID,
    primaryKey: true,
    defaultValue: literal('uuid_generate_v4()'),
  })
  declare uuid: UUID;
}
