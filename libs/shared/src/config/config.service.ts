import { Inject, Injectable } from '@nestjs/common';
import dotenv from 'dotenv';
import { merge } from 'lodash';
import fs from 'fs';
import path from 'path';
import json5 from 'json5';
import { constants } from '@telegram_broadcast_service/shared/src/config/constants';
import { ConfigMap, ConfigOptions } from '@telegram_broadcast_service/shared/src/config/interfaces';

@Injectable()
export class ConfigService {
  private readonly configMap: ConfigMap;

  constructor(@Inject(constants.CONFIG_OPTIONS) options: ConfigOptions) {
    const cwd = process.cwd();
    
    const envFile = path.resolve(cwd, options.folder, `local.env`);
    const lConfigMap = dotenv.config({ path: envFile }).parsed;

    const confFile = path.resolve(cwd, options.folder, 'conf.json5');

    const env = `${process.env['app.env'] || 'local'}`;
    const vConfFile = path.resolve(cwd, options.folder, `config-${env}.json5`);
    const configMap = json5.parse(fs.readFileSync(confFile).toString('utf8'));
    let vConfigMap: any = {};
    try {
      vConfigMap = json5.parse(fs.readFileSync(vConfFile).toString('utf8'));
    } catch (err) {}

    this.configMap = merge(configMap, lConfigMap, vConfigMap);
    this.parse();
  }

  public get<T>(key: string): T {
    return this.configMap[key] as unknown as T;
  }

  private parse(): void {
    for (const name in this.configMap) {
      const config = this.configMap[name];
      this.merge(this.configMap, config, name);
    }
  }

  private set(configs: any, name: string, joinedKey: string): void {
    const data = this.get(joinedKey);
    const envData = process.env[joinedKey];

    data && (configs[name] = this.typeCast(data));
    envData && (configs[name] = this.typeCast(envData));
    if (!envData && (typeof data === 'string' || typeof data === 'number')) {
      process.env[joinedKey] = `${data}`;
    }
    this.configMap[joinedKey] = configs[name];
  }

  private merge(configs: any, config: any, name: string, joinedKey?: string): void {
    if (joinedKey) {
      joinedKey = `${joinedKey}.${name}`;
    } else {
      joinedKey = name;
    }
    if (typeof config !== 'object') {
      this.set(configs, name, joinedKey);
    } else if (typeof config === 'object') {
      for (const subName in config) {
        const sConfig = configs[name];
        this.set(configs, name, joinedKey);
        if (sConfig) {
          this.merge(configs[name], sConfig[subName], subName, joinedKey);
        }
      }
    }
  }

  private typeCast(data: any) {
    if (data === 'true') {
      data = true;
    }
    if (data === 'false') {
      data = false;
    }
    return data;
  }
}
