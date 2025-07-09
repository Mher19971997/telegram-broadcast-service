import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { ConfigModule } from '@telegram_broadcast_service/shared/src/config/config.module';
import { SequelizeModule } from '@telegram_broadcast_service/shared/src/sequelize/sequelize.module';
import { CryptoService } from '@telegram_broadcast_service/shared/src/crypto/crypto.service';
import { MigrationCommand } from '@telegram_broadcast_service/migration/src/command/migration.command';
import { MigrationService } from '@telegram_broadcast_service/migration/src/migration.service';
import { MigrationEntry } from '@telegram_broadcast_service/migration/src/command/repository/migration.repository';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot(),
    SequelizeModule,
    MigrationEntry,
  ],
  providers: [CryptoService, MigrationCommand, MigrationService],
})
export class MigrationModule {}
