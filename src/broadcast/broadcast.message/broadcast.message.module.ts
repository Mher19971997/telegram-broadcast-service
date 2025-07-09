import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BroadcastMessageService } from '@telegram_broadcast_service/src/broadcast/broadcast.message/broadcast.message.service';
import { BroadcastJobModule } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.module';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';
import { constants } from '@telegram_broadcast_service/shared/src/config/constants';

@Module({
  imports: [
    BroadcastJobModule,
    BullModule.registerQueueAsync({
      name: constants.BROADCAST_QUEUE,
      useFactory: (configService: ConfigService): { name: string; redis: any } => ({
        name: constants.BROADCAST_QUEUE,
        redis: {
          host: configService.get('db.redis.host'),
          port: parseInt(configService.get('db.redis.port'), 10),
          password: configService.get('db.redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BroadcastMessageService],
  exports: [BroadcastMessageService]
})
export class BroadcastMessageModule { }