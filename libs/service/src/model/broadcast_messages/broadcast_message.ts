import { SequelizeModule } from '@nestjs/sequelize';
import * as st from 'sequelize-typescript';
import { CommonModel } from '@telegram_broadcast_service/shared/src/sequelize/common-model';
import { BroadcastJob } from '@telegram_broadcast_service/service/src/model/broadcast-job/broadcast-job';
import { BroadcastMessageEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.message/dto/output';
import { BroadcastJobEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.job/dto/output';

export enum MessageType {
  TEXT = 'text',
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

@st.Table({
  tableName: 'broadcast_messages',
  modelName: 'BroadcastMessage',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
})
export class BroadcastMessage extends CommonModel<BroadcastMessageEntity> {
  @st.Column({
    type: st.DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @st.Column({
    type: st.DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @st.Column({
    type: st.DataType.ENUM(...Object.values(MessageType)),
    defaultValue: MessageType.TEXT,
  })
  declare type: MessageType;

  @st.Column({
    type: st.DataType.JSONB,
    allowNull: true,
  })
  declare media: any;

  @st.Column({
    type: st.DataType.JSONB,
    allowNull: true,
  })
  declare keyboard: any;

  @st.Column({
    type: st.DataType.JSONB,
    defaultValue: [],
  })
  declare targetTags: string[];

  @st.Column({
    type: st.DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isScheduled: boolean;

  @st.Column({
    type: st.DataType.DATE,
    allowNull: true,
  })
  declare scheduledAt: Date;

  @st.Column({
    type: st.DataType.STRING,
    allowNull: true,
  })
  declare authorId: string;

  @st.HasMany(() => BroadcastJob)
  declare jobs: BroadcastJobEntity[];
}

export const BroadcastMessageEntry = SequelizeModule.forFeature([BroadcastMessage]);