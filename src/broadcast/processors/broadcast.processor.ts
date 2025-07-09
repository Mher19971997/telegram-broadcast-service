import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';

import { Logger } from '@telegram_broadcast_service/shared/src/util/logger';
import { TelegramSubscriberService } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.service';
import { BroadcastJobService } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.service';
import { TelegramBotService } from '@telegram_broadcast_service/src/telegram/telegram.bot/telegram.bot.service';
import { MessageType } from '@telegram_broadcast_service/service/src/model/broadcast_messages/broadcast_message';
import { BroadcastMessageService } from '@telegram_broadcast_service/src/broadcast/broadcast.message/broadcast.message.service';
import { constants } from '@telegram_broadcast_service/shared/src/config/constants';

interface BroadcastJobData {
  messageId?: string;
  jobId: string;
}

@Injectable()
@Processor("broadcast-queue")
export class BroadcastProcessor {
  private logger = new Logger(BroadcastProcessor.name);

  constructor(
    private readonly telegramSubscriberService: TelegramSubscriberService,
    private readonly broadcastMessageService: BroadcastMessageService,
    private readonly broadcastJobService: BroadcastJobService,
    private readonly telegramBotService: TelegramBotService,
  ) { }

  @Process('send-broadcast')
  async handleBroadcast(job: Job<BroadcastJobData>) {
    const { messageId, jobId } = job.data;

    this.logger.log(`Starting broadcast job: ${jobId}`);

    try {
      // Получаем задачу и сообщение
      const broadcastJob = await this.broadcastJobService.findOne({
        filterMeta: { uuid: jobId }
      } as any);
      console.log(broadcastJob,"broadcastJob");
      
      const message = await this.broadcastMessageService.findOne({
        filterMeta: { uuid: messageId }
      } as any);
      console.log(message,"messagemessage");
      
      if (!broadcastJob || !message) {
        throw new Error('Broadcast job or message not found');
      }

      // Получаем подписчиков для рассылки
      const subscribers = await this.telegramSubscriberService.getActiveSubscribers(
        message.targetTags
      );
      
      // Начинаем выполнение задачи
      await this.broadcastJobService.startJob(jobId, subscribers.length);
      
      this.logger.log(`Found ${subscribers.length} subscribers for broadcast`);

      let sentCount = 0;
      let failedCount = 0;
      let blockedCount = 0;
      const errors: any[] = [];

      // Отправляем сообщения порциями
      const BATCH_SIZE = 30;
      console.log(111111);
      
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (subscriber: { telegramId: string; }) => {
          try {
            const result = await this.telegramBotService.sendMessage(
              subscriber.telegramId,
              message.content,
              {
                keyboard: message.keyboard,
                media: message.media,
                type: message.type as MessageType,
              }
            );

            if (result.success) {
              sentCount++;
            } else {
              failedCount++;
              errors.push({
                subscriberId: subscriber.telegramId,
                error: result.error,
              });

              // Проверяем, заблокирован ли подписчик
              const updatedSubscriber = await this.telegramSubscriberService.findByTelegramId(
                subscriber.telegramId
              );

              if (updatedSubscriber?.isBlocked) {
                blockedCount++;
              }
            }
          } catch (error) {
            failedCount++;
            errors.push({
              subscriberId: subscriber.telegramId,
              error: error.message,
            });
          }
        });

        await Promise.all(promises);

        // Обновляем прогресс
        const progressPercent = Math.round(((i + batch.length) / subscribers.length) * 100);
        console.log(jobId,777);
        
        await this.broadcastJobService.updateProgress(jobId, {
          sentCount,
          failedCount,
          blockedCount,
          errors,
          progressPercent,
        });

        // Обновляем прогресс задачи
        job.progress(progressPercent);

        this.logger.log(`Broadcast progress: ${progressPercent}% (${sentCount}/${subscribers.length})`);

        // Небольшая задержка между батчами
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Завершаем задачу
      await this.broadcastJobService.completeJob(jobId, {
        sentCount,
        failedCount,
        blockedCount,
        errors,
      });

      this.logger.log(`Broadcast job completed: ${jobId}. Sent: ${sentCount}, Failed: ${failedCount}, Blocked: ${blockedCount}`);

      return {
        totalUsers: subscribers.length,
        sentCount,
        failedCount,
        blockedCount,
      };
    } catch (error) {
      this.logger.error(`Broadcast job failed: ${jobId}`, error);

      await this.broadcastJobService.failJob(jobId, error.message);

      throw error;
    }
  }

  @Process('cleanup-old-jobs')
  async cleanupOldJobs() {
    const deletedCount = await this.broadcastJobService.cleanupOldJobs();
    this.logger.log(`Cleaned up ${deletedCount} old broadcast jobs`);
  }
}