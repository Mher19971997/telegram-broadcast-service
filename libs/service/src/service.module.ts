import { DynamicModule, Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@telegram_broadcast_service/shared/src/sequelize/sequelize.module';
import { ConfigModule } from '@telegram_broadcast_service/shared/src/config/config.module';
import { ModelModule } from '@telegram_broadcast_service/service/src/model/model.module';

@Global()
@Module({
  imports: [ModelModule]
})
export class ServiceModule {
  static register(): DynamicModule {
    const services = [ConfigModule, SequelizeModule, ModelModule];
    return {
      module: ServiceModule,
      imports: services,
      exports: services
    };
  }
}
