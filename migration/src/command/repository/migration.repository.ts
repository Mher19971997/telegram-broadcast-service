import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { SequelizeModule } from '@nestjs/sequelize';
import { literal } from 'sequelize';
import { UUID } from '@telegram_broadcast_service/shared/src/sequelize/meta';

@Table({ tableName: 'migrations' })
export class Migration extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: literal('uuid_generate_v4()'),
  })
  declare uuid: UUID;

  @Column({ type: DataType.STRING })
  declare name: string;

  @Column({ type: DataType.STRING })
  declare state: string;

  @Column({ type: DataType.STRING })
  declare hex: string;

  @Column({ type: DataType.INTEGER })
  declare version: number;
}

export const MigrationEntry = SequelizeModule.forFeature([Migration]);
