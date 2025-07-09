import { SequelizeModule } from '@nestjs/sequelize';
import * as st from 'sequelize-typescript';
import { CommonModel } from '@telegram_broadcast_service/shared/src/sequelize/common-model';
import { BroadcastMessage } from '@telegram_broadcast_service/service/src/model/broadcast_messages/broadcast_message';
import { BroadcastJobEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.job/dto/output';
import { BroadcastMessageEntity } from '@telegram_broadcast_service/src/broadcast/broadcast.message/dto/output';

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@st.Table({
  tableName: 'broadcast_jobs',
  modelName: 'BroadcastJob',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
})
export class BroadcastJob extends CommonModel<BroadcastJobEntity> {
  @st.ForeignKey(() => BroadcastMessage)
  @st.Column({
    type: st.DataType.UUID,
    allowNull: false,
  })
  declare messageUuid: string;


  @st.Column({
    type: st.DataType.ENUM(...Object.values(JobStatus)),
    defaultValue: JobStatus.PENDING,
  })
  declare status: JobStatus;

  @st.Column({
    type: st.DataType.INTEGER,
    defaultValue: 0,
  })
  declare totalUsers: number;

  @st.Column({
    type: st.DataType.INTEGER,
    defaultValue: 0,
  })
  declare sentCount: number;

  @st.Column({
    type: st.DataType.INTEGER,
    defaultValue: 0,
  })
  declare failedCount: number;

  @st.Column({
    type: st.DataType.INTEGER,
    defaultValue: 0,
  })
  declare blockedCount: number;

  @st.Column({
    type: st.DataType.JSONB,
    defaultValue: [],
  })
  declare errors: any[];

  @st.Column({
    type: st.DataType.INTEGER,
    defaultValue: 0,
  })
  declare progressPercent: number;

  @st.Column({
    type: st.DataType.DATE,
    allowNull: true,
  })
  declare startedAt: Date;

  @st.Column({
    type: st.DataType.DATE,
    allowNull: true,
  })
  declare completedAt: Date;

  @st.BelongsTo(() => BroadcastMessage, { targetKey: 'uuid', foreignKey: 'messageUuid' })
  declare message: BroadcastMessageEntity;
}

export const BroadcastJobEntry = SequelizeModule.forFeature([BroadcastJob]);