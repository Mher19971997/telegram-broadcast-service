import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { TelegramSubscriberService } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.service';
import { BroadcastJobService } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.service';
import { telegramSubscriberDto } from '@telegram_broadcast_service/src/telegram/subscriber/dto';
import { broadcastJobDto } from '@telegram_broadcast_service/src/broadcast/broadcast.job/dto';
import { broadcastMessageDto } from '@telegram_broadcast_service/src/broadcast/broadcast.message/dto';
import { BroadcastMessageService } from '@telegram_broadcast_service/src/broadcast/broadcast.message/broadcast.message.service';

@ApiTags('Telegram Broadcast')
@Controller('telegram/broadcast')
export class TelegramBroadcastController {
  constructor(
    private readonly telegramSubscriberService: TelegramSubscriberService,
    private readonly broadcastMessageService: BroadcastMessageService,
    private readonly broadcastJobService: BroadcastJobService,
  ) { }

  @Post('messages')
  @ApiOperation({ summary: 'Создать сообщение для рассылки' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async createBroadcastMessage(
    @Body() createBroadcastDto: broadcastMessageDto.inputs.CreateBroadcastMessageInput,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.create(createBroadcastDto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Получить все сообщения рассылки' })
  @ApiResponse({ type: [broadcastMessageDto.outputs.BroadcastMessageEntity] })
  async getAllBroadcastMessages(
    @Query() filter: broadcastMessageDto.inputs.FilterBroadcastMessageInput,
  ) {
    return await this.broadcastMessageService.findAll(filter);
  }

  @Get('messages/:messageId')
  @ApiOperation({ summary: 'Получить сообщение по ID' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async getBroadcastMessage(
    @Param('messageId') messageId: string,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.findOne({
      uuid: messageId
    });
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Обновить сообщение' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async updateBroadcastMessage(
    @Param('messageId') messageId: string,
    @Body() updateDto: broadcastMessageDto.inputs.UpdateBroadcastMessageInput,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.update(
      { uuid: messageId },
      updateDto
    );
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Удалить сообщение' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async deleteBroadcastMessage(
    @Param('messageId') messageId: string,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.remove({
      uuid: messageId
    });
  }

  @Post('messages/:messageUuid/send')
  @ApiOperation({ summary: 'Отправить рассылку' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async sendBroadcast(
    @Param('messageUuid') messageUuid: string,
    @Body('authorId') authorId?: string,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.sendBroadcast(messageUuid, authorId);
  }

  @Post('messages/:messageId/schedule')
  @ApiOperation({ summary: 'Запланировать рассылку' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async scheduleBroadcast(
    @Param('messageId') messageId: string,
    @Body('scheduledAt') scheduledAt: Date,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.scheduleMessage(messageId, scheduledAt);
  }

  @Post('messages/:messageId/cancel-schedule')
  @ApiOperation({ summary: 'Отменить запланированную рассылку' })
  @ApiResponse({ type: broadcastMessageDto.outputs.BroadcastMessageEntity })
  async cancelScheduledBroadcast(
    @Param('messageId') messageId: string,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity> {
    return await this.broadcastMessageService.cancelScheduledMessage(messageId);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Получить все задачи рассылки' })
  @ApiResponse({ type: [broadcastJobDto.outputs.BroadcastJobEntity] })
  async getAllBroadcastJobs(
    @Query() filter: broadcastJobDto.inputs.FilterBroadcastJobInput,
  ) {
    return await this.broadcastJobService.findAll(filter);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Получить статистику рассылки' })
  @ApiResponse({ type: broadcastJobDto.outputs.BroadcastJobEntity })
  async getBroadcastJobStats(
    @Param('jobId') jobId: string,
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity> {
    return await this.broadcastJobService.getJobWithMessage(jobId);
  }

  @Get('jobs/status/:status')
  @ApiOperation({ summary: 'Получить задачи по статусу' })
  @ApiResponse({ type: [broadcastJobDto.outputs.BroadcastJobEntity] })
  async getBroadcastJobsByStatus(
    @Param('status') status: string,
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity[]> {
    return await this.broadcastJobService.getJobsByStatus(status);
  }

  @Get('jobs/recent/:limit')
  @ApiOperation({ summary: 'Получить последние задачи' })
  @ApiResponse({ type: [broadcastJobDto.outputs.BroadcastJobEntity] })
  async getRecentBroadcastJobs(
    @Param('limit') limit: number,
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity[]> {
    return await this.broadcastJobService.getRecentJobs(limit);
  }

  @Get('subscribers')
  @ApiOperation({ summary: 'Получить подписчиков' })
  @ApiResponse({ type: [telegramSubscriberDto.outputs.TelegramSubscriberEntity] })
  async getSubscribers(
    @Query() filter: telegramSubscriberDto.inputs.FilterTelegramSubscriberInput,
  ) {
    return await this.telegramSubscriberService.findAll(filter);
  }

  @Get('subscribers/active')
  @ApiOperation({ summary: 'Получить активных подписчиков' })
  @ApiResponse({ type: [telegramSubscriberDto.outputs.TelegramSubscriberEntity] })
  async getActiveSubscribers(
    @Query('tags') tags?: string,
  ): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity[]> {
    const targetTags = tags ? tags.split(',') : undefined;
    return await this.telegramSubscriberService.getActiveSubscribers(targetTags);
  }

  @Get('subscribers/:telegramId')
  @ApiOperation({ summary: 'Получить подписчика по Telegram ID' })
  @ApiResponse({ type: telegramSubscriberDto.outputs.TelegramSubscriberEntity })
  async getSubscriberByTelegramId(
    @Param('telegramId') telegramId: string,
  ): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity> {
    return await this.telegramSubscriberService.findByTelegramId(telegramId);
  }

  @Post('subscribers')
  @ApiOperation({ summary: 'Создать подписчика' })
  @ApiResponse({ type: telegramSubscriberDto.outputs.TelegramSubscriberEntity })
  async createSubscriber(
    @Body() createSubscriberDto: telegramSubscriberDto.inputs.CreateTelegramSubscriberInput,
  ): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity> {
    return await this.telegramSubscriberService.create(createSubscriberDto);
  }

  @Put('subscribers/:telegramId')
  @ApiOperation({ summary: 'Обновить подписчика' })
  @ApiResponse({ type: telegramSubscriberDto.outputs.TelegramSubscriberEntity })
  async updateSubscriber(
    @Param('telegramId') telegramId: string,
    @Body() updateDto: telegramSubscriberDto.inputs.UpdateTelegramSubscriberInput,
  ): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity> {
    return await this.telegramSubscriberService.update(
      { telegramId },
      updateDto
    );
  }

  @Post('subscribers/:telegramId/tags')
  @ApiOperation({ summary: 'Добавить теги подписчику' })
  @ApiResponse({ type: telegramSubscriberDto.outputs.TelegramSubscriberEntity })
  async addSubscriberTags(
    @Param('telegramId') telegramId: string,
    @Body('tags') tags: string[],
  ): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity> {
    return await this.telegramSubscriberService.addTags(telegramId, tags);
  }

  @Delete('subscribers/:telegramId/tags')
  @ApiOperation({ summary: 'Удалить теги подписчика' })
  @ApiResponse({ type: telegramSubscriberDto.outputs.TelegramSubscriberEntity })
  async removeSubscriberTags(
    @Param('telegramId') telegramId: string,
    @Body('tags') tags: string[],
  ): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity> {
    return await this.telegramSubscriberService.removeTags(telegramId, tags);
  }

  @Get('stats/subscribers')
  @ApiOperation({ summary: 'Получить статистику подписчиков' })
  async getSubscriberStats() {
    return await this.telegramSubscriberService.getSubscriberStats();
  }

  @Get('stats/jobs/cleanup')
  @ApiOperation({ summary: 'Очистить старые задачи' })
  async cleanupOldJobs(@Query('days') days = 30) {
    return {
      deletedCount: await this.broadcastJobService.cleanupOldJobs(days),
    };
  }
}