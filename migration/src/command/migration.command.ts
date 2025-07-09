import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { MigrationService } from '@telegram_broadcast_service/migration/src/migration.service';

@Injectable()
export class MigrationCommand {
  constructor(private readonly migration: MigrationService) {}

  @Command({
    command: 'list',
    describe: 'get migration list',
  })
  async list() {
    return this.migration.list();
  }

  @Command({
    command: 'sync',
    describe: 'sync migrations',
  })
  async sync() {
    return this.migration.sync();
  }

  @Command({
    command: 'add <name>',
    describe: 'add new migration',
  })
  async add(
    @Positional({
      name: 'name',
      describe: 'migration name (ex: "config")',
      type: 'string',
    })
    migration: string,
  ) {
    return this.migration.add(migration);
  }

  @Command({
    command: 'up <name>',
    describe: 'up a migration',
  })
  async up(
    @Positional({
      name: 'name',
      describe: 'migration name (ex: "config", "all", "index")',
      type: 'string',
    })
    migration: string,
  ) {
    return this.migration.up(migration);
  }
}
