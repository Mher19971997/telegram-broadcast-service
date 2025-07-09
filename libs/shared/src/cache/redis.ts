import { Injectable } from '@nestjs/common';
import {
  createClient,
  RedisClientOptions,
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from 'redis';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

@Injectable()
export class Redis {
  public client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

  constructor(private readonly configService: ConfigService) {}

  async connection() {
    const options = this.configService.get<RedisClientOptions>('db.redis');
    this.client = createClient(options);
    await this.client.connect();
  }
}
