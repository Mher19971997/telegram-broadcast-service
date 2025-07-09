import 'source-map-support/register';
import '@telegram_broadcast_service/shared/src/util/global';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@telegram_broadcast_service/shared/src/util/logger';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';
import { ValidationPipe } from '@telegram_broadcast_service/shared/src/pipes/validation.pipe';
import { UrlParserInspector } from '@telegram_broadcast_service/shared/src/inspector/url-parser.inspector';
import { EmptyResponseInspector } from '@telegram_broadcast_service/shared/src/inspector/empty-response.inspector';
import { AllExceptionsFilter } from '@telegram_broadcast_service/shared/src/filters/all-exceptions.filter';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { INestApplication } from '@nestjs/common';
import basicAuth from 'express-basic-auth'

export const server = async (app: NestExpressApplication, mod: any, confPref: string) => {
  const configs = app.get(ConfigService);
  global.Configs = configs;
  const logger = new Logger(mod.name);
  const appConf = configs.get<any>(confPref);

  app.useLogger([configs.get<any>('app.logging')]);
  app.useGlobalPipes(new ValidationPipe(logger));
  // app.useGlobalInterceptors(new RequestLimitInspector());
  app.useGlobalInterceptors(new UrlParserInspector());
  app.useGlobalInterceptors(new EmptyResponseInspector());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix(`${appConf.endpoint}/${appConf.version}`);
  app.enableCors({ origin: '*' });
  app.useStaticAssets('static');
  await swagger(app, mod, confPref);

  await app.listen(Number(appConf.http.port), appConf.http.host);
  logger.log(`Application is running on: ${await app.getUrl()}`);
};

export const loadConfig = async () => {

};

export const swagger = async (app: INestApplication, mod: any, confPref: string) => {
  const configs = app.get(ConfigService);
  const logger = new Logger(mod.name);
  const appConf = configs.get<any>(confPref);
  // Ensure proper string concatenation or template literals for paths
  app.use(
    [`${appConf.endpoint}/api`, `${appConf.endpoint}/api-json`],
    basicAuth({
      challenge: true,
      users: { [appConf.swagger.user]: appConf.swagger.pass },
    }),
  );

  // Using template literals for logging
  logger.log(`${appConf.endpoint}/api , ${appConf.endpoint}/api-json`);

  const servers = configs.get<string[]>(`${confPref}.swagger.servers`);
  const options = new DocumentBuilder()
    .setTitle(confPref)
    .setVersion('2.0')
  // .addTag('doc');

  servers.forEach((value) => {
    options.addServer(value);
  });

  const document = SwaggerModule.createDocument(app, options.build(), { deepScanRoutes: true });


  // Initialize SwaggerTheme and select the desired theme
  const theme = new SwaggerTheme();
  const customCss = theme.getBuffer(SwaggerThemeNameEnum.DARK); // Change 'dark' to 'light' or other themes as needed

  // Use template literals to interpolate variables in string
  await SwaggerModule.setup(`${appConf.endpoint}/doc`, app, document, {
    explorer: true,
    customSiteTitle: 'Telegram Broadcast API',
    customCss
  });
};

export const startApp = async (mod: any, confPref: string) => {
  await loadConfig();
  const logger = new Logger(mod.name);
  const app = await NestFactory.create<NestExpressApplication>(mod, { logger });

  await server(app, mod, confPref);
};
