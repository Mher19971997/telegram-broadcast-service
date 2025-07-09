import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';
import { constants } from '@telegram_broadcast_service/shared/src/config/constants';

export interface ConfigModuleOptions {
  folder?: string;
}

@Global()
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    options.folder = options.folder || './config';
    return {
      module: ConfigModule,
      providers: [
        {
          provide: constants.CONFIG_OPTIONS,
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
