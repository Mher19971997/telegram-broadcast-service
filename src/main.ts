import { AppModule } from '@telegram_broadcast_service/src/app.module';
import { startApp } from '@telegram_broadcast_service/service/src/index';

(async function bootstrap() {
  process.env['app.name'] = 'app-api';
  await startApp(AppModule, 'app-api');
})();
