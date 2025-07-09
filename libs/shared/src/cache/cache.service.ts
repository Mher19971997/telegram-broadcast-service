import { Injectable } from '@nestjs/common';
import { Redis } from '@telegram_broadcast_service/shared/src/cache/redis';
import { RedisClientType, RedisDefaultModules, RedisFunctions, RedisModules, RedisScripts } from 'redis';
import { json5 } from '@telegram_broadcast_service/shared/src/util/parser/json5';

@Injectable()
export class CacheService {
  public client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

  constructor(private redis: Redis) {}

  async set(key: any, val: any, opt: any) {
    await this.conn();
    return this.client.set(key, json5.stringify(val), opt);
  }

  async get(key: any) {
    await this.conn();
    return json5.parse(await this.client.get(key));
  }

  async has(key: any) {
    await this.conn();
    return !!(await this.get(key));
  }

  async scan(key: any): Promise<string[]> {
    await this.conn();
    const res = [];
    for await (const rKey of this.client.scanIterator({
      MATCH: `${key}*`,
      COUNT: 1000000,
    })) {
      res.push(rKey);
    }
    return res;
  }

  async del(key: any) {
    await this.conn();
    return !!(await this.client.del(key));
  }

  async conn() {
    if (!this.client) {
      await this.redis.connection();
      this.client = this.redis.client;
    }
  }
}
