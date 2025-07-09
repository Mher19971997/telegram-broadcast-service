import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import { MigrationModule } from './migration.module';
import { CommandModule, CommandService } from 'nestjs-command';
import '@telegram_broadcast_service/shared/src/util/global';

(async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.error(error);
    await app.close();
    process.exit(1);
  }
})();
