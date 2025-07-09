import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CommonStore } from '../store/CommonStore';

@Injectable()
export class _templateService extends CommonStore {
  private readonly logger = new Logger(_templateService.name);

  constructor(@InjectConnection() private connection: Sequelize) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async up(): Promise<void> {}
}
