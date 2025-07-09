import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

declare global {
  // eslint-disable-next-line no-var
  var app: NestExpressApplication;
  // eslint-disable-next-line no-var
  var Configs: ConfigService;
  // eslint-disable-next-line no-var
  var __stack: string | any[] | undefined;
  // eslint-disable-next-line no-var
  var __line: number | null;
  // eslint-disable-next-line no-var
  var __module: string | null;
  // eslint-disable-next-line no-var
  var __function: string | null;
  // eslint-disable-next-line no-var
  var __method: string | null;
}
