import { Injectable } from '@nestjs/common';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  numGen(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
