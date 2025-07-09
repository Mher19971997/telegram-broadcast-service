import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import fs from 'fs';
import util from 'util';
import path from 'path';
import crypto from 'crypto';
import { differenceWith, isEqual } from 'lodash';
import { Sequelize } from 'sequelize-typescript';
import { stores } from '@telegram_broadcast_service/migration/src/store';
import { CryptoService } from '@telegram_broadcast_service/shared/src/crypto/crypto.service';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';
import { Migration } from '@telegram_broadcast_service/migration/src/command/repository/migration.repository';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectConnection()
    private connection: Sequelize,
    @InjectModel(Migration)
    private readonly migrationModel: typeof Migration,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  async list(): Promise<void> {
    await this.migrationModel.sync();
    const list = await this.migrationModel.findAll({
      order: [['version', 'ASC']],
    });
    if (!list.length) {
      return this.logger.error(`\n No migrations`);
    }
    this.logInfo(list);
  }

  async sync(): Promise<void> {
    await this.migrationModel.sync();
    const storeDir = path.join(__dirname, 'store');
    const mList = (await util.promisify(fs.readdir)(storeDir))
      .filter((value) => value.search(/index/gm))
      .map((value) => value.split('.')[0].replace('V', '').split('_'))
      .filter((value) => value.length === 2);

    const list = await this.migrationModel.findAll({
      order: [['version', 'ASC']],
    });

    const nList: any = differenceWith(
      mList.map((value) => ({ version: Number(value[0]), name: value[1] })),
      list.map((value: any) => ({
        version: Number(value.version),
        name: value.name,
      })),
      isEqual,
    ).sort((val1, val2) => val1.version - val2.version);

    const exList: any = differenceWith(
      mList.map((value) => ({ version: Number(value[0]), name: value[1] })),
      list.map((value: any) => ({
        version: Number(value.version),
        name: value.name,
      })),
      (a1, a2) => a1 === a2,
    ).sort((val1, val2) => val1.version - val2.version);

    for await (const migration of nList) {
      migration.name && (await this.add(migration.name, --migration.version));
    }
    for await (const migration of exList) {
      if (!migration.name) {
        continue;
      }
      const hex = this.getFileHex(migration);
      const dStore = await this.migrationModel.findOne({
        where: {
          version: Number(migration.version),
          name: migration.name,
        },
      });
      if (dStore.hex !== hex) {
        await this.migrationModel.update(
          { hex },
          {
            where: {
              version: Number(migration.version),
              name: migration.name,
            },
          },
        );
      }
    }
    if (!nList.length) {
      return this.logger.log(`\n No new migrations`);
    }

    this.logInfo(list);
  }

  async add(name: string, version?: number): Promise<void> {
    await this.migrationModel.sync();
    const count = (version > 0 && version) || (await this.migrationModel.count({}));
    const fileInfo = await this.generate(name, count);
    const migration = await this.migrationModel.create({
      state: 'Pending',
      ...fileInfo,
    });
    this.logger.log(`Migration: [ ${migration.name} | ${migration.state} | ${migration.hex} | created ]`);
  }

  async up(migration: string): Promise<void> {
    await this.migrationModel.sync();
    const filter: any = { state: 'Pending' };
    await this.makeFilter(filter, migration);
    const migrationList = await this.migrationModel.findAll({
      where: filter,
      order: [['version', 'ASC']],
      raw: true,
    });

    if (!migrationList.length) {
      return this.logger.log(`\n Nothing to up`);
    }

    await this.processMigration(migrationList, 'Complete', 'up');
  }

  private async generate(name: string, version: number): Promise<{ name: string; hex?: string; version: number }> {
    const template = path.join(__dirname, 'template', '_template.service.ts');
    ++version;
    const serviceName = `V${version}_${name}`;
    const file = path.join(__dirname, 'store', `${serviceName}.service.ts`);
    const indexFile = path.join(__dirname, 'store', 'index.ts');

    const exFile = fs.existsSync(file);

    if (exFile) {
      return { name, hex: this.getFileHex({ version, name }), version };
    }

    const tContent = (await util.promisify(fs.readFile)(template))
      .toString()
      .replace(/_templateService/gmu, serviceName);
    await util.promisify(fs.writeFile)(file, tContent);

    const hex = this.getFileHex({ version, name });

    const indexContent = (await util.promisify(fs.readFile)(indexFile)).toString();
    let [importPart, exportPart] = indexContent.split('// ------');
    importPart += `import { ${serviceName} } from './${serviceName}.service';`;
    exportPart = exportPart.replace(
      /];/g,
      `${version === 1 ? '\n' : ''}  { provide: Migration, useClass: ${serviceName}, multi: true },\n];`,
    );
    await util.promisify(fs.writeFile)(indexFile, [importPart, exportPart].join('\n// ------'));

    return { name, hex, version };
  }

  private async makeFilter(filter: any, migration: string): Promise<void> {
    if (!isNaN(Number(migration))) {
      filter.version = Number(migration);
    }
    if (isNaN(Number(migration))) {
      filter.name = migration;
    }
    if (migration === 'all') {
      delete filter.name;
    }
  }

  private async processMigration(migrationList: any, state: string, action: string): Promise<void> {
    for await (const migrationObj of migrationList) {
      const store = stores.find((val) => val.useClass.name === `V${migrationObj.version}_${migrationObj.name}`);

      if (!store) {
        this.logger.error(`\n Wrong migrations ${migrationObj.name}`);
        continue;
      }
      const hex = this.getFileHex(migrationObj);

      await new store.useClass(this.connection, this.cryptoService, this.configService)[action]();
      await this.migrationModel.update({ state, hex }, { where: { uuid: migrationObj.uuid } });
      this.logger.log(`\nMigrate: ${migrationObj.version}_${migrationObj.name} ${action}`);
    }
  }

  private getFileHex(migration: { version: number; name: string }): string {
    const serviceName = `V${migration.version}_${migration.name}`;
    const file = path.join(__dirname, 'store', `${serviceName}.service.ts`);
    const fileBuffer = fs.readFileSync(file);
    const hashSum = crypto.createHash('sha256').update(fileBuffer);
    return `sha256:${hashSum.digest('hex')}`;
  }

  private logInfo(list: any[]) {
    list.forEach((migration: any) => {
      const hex = this.getFileHex(migration);

      this.logger.log(
        `Migration: [ ${migration.name} | ${migration.state} | ${migration.hex} | ${
          (hex === migration.hex && 'not ') || ''
        }changed ]`,
      );
    });
  }
}
