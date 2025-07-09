import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path'

import { ServiceModule } from '@telegram_broadcast_service/service/src/service.module';
import { ConfigModule } from '@telegram_broadcast_service/shared/src/config/config.module';
import { SequelizeModule } from '@telegram_broadcast_service/shared/src/sequelize/sequelize.module';
import { FilesModule } from '@telegram_broadcast_service/shared/src/files/files.module';

import { TelegramSubscriberModule } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.module';
import { BroadcastJobModule } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.module';
import { BroadcastModule } from '@telegram_broadcast_service/src/broadcast/broadcast.module';
import { BroadcastMessageModule } from '@telegram_broadcast_service/src/broadcast/broadcast.message/broadcast.message.module';
import { TelegramBotModule } from '@telegram_broadcast_service/src/telegram/telegram.bot/telegram.bot.module';
import { constants } from '@telegram_broadcast_service/shared/src/config/constants';

@Module({
  imports: [
    ServiceModule.register(),
    ServeStaticModule.forRoot({ rootPath: path.resolve(__dirname, 'static') }),
    ConfigModule.forRoot(),
    SequelizeModule,
    FilesModule,
    TelegramSubscriberModule,
    BroadcastJobModule,
    BroadcastMessageModule,
    BroadcastModule,
    TelegramBotModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule { }
