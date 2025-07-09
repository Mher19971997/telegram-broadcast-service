import { Injectable } from '@nestjs/common';
import Consul from 'consul';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

@Injectable()
export class ConsulService {
  private consul: Consul.Consul;

  constructor(private readonly configService: ConfigService) {}

  async registerService() {
    const config = this.configService.get<any>('service.consul');
    const env = this.configService.get<string>('app.env');
    const name = this.configService.get<string>('app.name');
    const service = this.configService.get<any>(`${name}`);
    if (env === 'local' || config.enabled === false) {
      return;
    }

    this.consul = new Consul(config);
    await this.consul.agent.service.deregister(`${name}.http`);
    await this.consul.agent.service.deregister(`${name}.tcp`);
    await this.consul.agent.service.register({
      name: `${name}.http`,
      address: service.http.host,
      port: service.http.port,
    });
    await this.consul.agent.service.register({
      name: `${name}.tcp`,
      address: service.tcp.host,
      port: service.tcp.port,
    });
  }
}
