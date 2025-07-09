import {  LogLevel, Module } from '@nestjs/common';
import { SequelizeModule as BaseSequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';
import { FilterService } from '@telegram_broadcast_service/shared/src/sequelize/filter.service';
import { ValidationService } from '@telegram_broadcast_service/shared/src/sequelize/validation.service';
import { Logger } from '@telegram_broadcast_service/shared/src/util/logger';

@Module({
  imports: [
    BaseSequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SequelizeModuleOptions => {
        const { url, ...options } = configService.get<any>('db.postgres');
        
        if (!options) {
          return {};
        }
        const dbUrl = new URL(url);
        const logger = new Logger(SequelizeModule.name);

        return {
          timezone: 'UTC',
          host: dbUrl.hostname,
          port: Number(dbUrl.port),
          username: dbUrl.username,
          password: dbUrl.password,
          minifyAliases: true,
          logQueryParameters: true,
          schema: 'public',
          hooks: true,
          dialectOptions: {
            useUTC: false,
          },
          ...options,
          logging: (sql, timing) => {
            logger[<LogLevel>options.logging](`${sql}, ${timing}`);
          },
        };
      },
    }),
  ],
  providers: [FilterService, ValidationService],
  exports: [FilterService, ValidationService],
})
export class SequelizeModule {}
