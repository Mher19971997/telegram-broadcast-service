import { SequelizeModule } from '@nestjs/sequelize';
import * as st from 'sequelize-typescript';
import { CommonModel } from '@telegram_broadcast_service/shared/src/sequelize/common-model';
import { TelegramSubscriberEntity } from '@telegram_broadcast_service/src/telegram/subscriber/dto/output';

@st.Table({
  tableName: 'telegram_subscribers',
  modelName: 'TelegramSubscriber',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
})
export class TelegramSubscriber extends CommonModel<TelegramSubscriberEntity> {
  @st.Column({
    type: st.DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare telegramId: string;

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare username: string;

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare firstName: string;

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare lastName: string;

  @st.Column({
    type: st.DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @st.Column({
    type: st.DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isBlocked: boolean;

  @st.Column({
    type: st.DataType.JSONB,
    defaultValue: [],
  })
  declare tags: string[];

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare language: string;

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare phone: string;

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare email: string;
}

export const TelegramSubscriberEntry = SequelizeModule.forFeature([TelegramSubscriber]);