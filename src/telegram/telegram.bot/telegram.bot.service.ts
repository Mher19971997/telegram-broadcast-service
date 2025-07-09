import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Bot, Context, InlineKeyboard } from 'grammy';
import { Logger } from '@telegram_broadcast_service/shared/src/util/logger';
import { TelegramSubscriberService } from '@telegram_broadcast_service/src/telegram/subscriber/telegram.subscriber.service';
import { MessageType } from '@telegram_broadcast_service/service/src/model/broadcast_messages/broadcast_message';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  private logger = new Logger(TelegramBotService.name);

  constructor(
    private readonly telegramSubscriberService: TelegramSubscriberService,
    private readonly configService: ConfigService,
  ) {
    this.bot = new Bot(this.configService.get<string>("service.telegram.token"));
  }

  async onModuleInit() {
    this.logger.log('TelegramBotService onModuleInit started');
    await this.setupBot();
    this.logger.log('Telegram bot started successfully');
  }
  async onModuleDestroy() {
    await this.bot.stop();
    this.logger.log('Telegram bot stopped');
  }

  private async setupBot() {
    this.bot.command('start', async (ctx: Context) => {
      await this.registerSubscriber(ctx);
      await ctx.reply(
        'Добро пожаловать! 🎉\n\n' +
        'Вы успешно подписались на рассылку.\n' +
        'Для отписки используйте команду /stop'
      );
    });

    this.bot.command('stop', async (ctx) => {
      await this.unregisterSubscriber(ctx);
      await ctx.reply('Вы отписались от рассылки. Для возобновления используйте /start');
    });

    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        'Доступные команды:\n\n' +
        '/start - Подписаться на рассылку\n' +
        '/stop - Отписаться от рассылки\n' +
        '/help - Показать это сообщение\n' +
        '/status - Проверить статус подписки'
      );
    });

    this.bot.command('status', async (ctx) => {
      const subscriber = await this.telegramSubscriberService.findByTelegramId(
        ctx.from.id.toString()
      );

      if (subscriber && subscriber.isActive) {
        await ctx.reply(`✅ Вы подписаны на рассылку\nТеги: ${subscriber.tags?.join(', ') || 'нет'}`);
      } else {
        await ctx.reply('❌ Вы не подписаны на рассылку');
      }
    });

    this.bot.catch((err) => {
      this.logger.error('Bot error:', err);
    });
  }

  private async registerSubscriber(ctx: Context) {
    const telegramId = ctx.from.id.toString();

    try {
      const existingSubscriber = await this.telegramSubscriberService.findByTelegramId(telegramId);

      if (existingSubscriber) {
        await this.telegramSubscriberService.update(
          { telegramId },
          {
            username: ctx.from.username,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            isActive: true,
            isBlocked: false,
          }
        );
      } else {
        await this.telegramSubscriberService.create({
          telegramId,
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          language: ctx.from.language_code,
          isActive: true,
          isBlocked: false,
          tags: [],
        });
      }

      this.logger.log(`Subscriber registered: ${telegramId}`);
    } catch (error) {
      this.logger.error('Error registering subscriber:', error);
    }
  }

  private async unregisterSubscriber(ctx: Context) {
    const telegramId = ctx.from.id.toString();

    try {
      await this.telegramSubscriberService.update(
        { telegramId },
        { isActive: false }
      );

      this.logger.log(`Subscriber unregistered: ${telegramId}`);
    } catch (error) {
      this.logger.error('Error unregistering subscriber:', error);
    }
  }

  async sendMessage(
    telegramId: string,
    text: string,
    options?: {
      keyboard?: InlineKeyboard;
      media?;
      type?: MessageType;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const chatId = parseInt(telegramId);

      switch (options?.type) {
        case MessageType.PHOTO:
          if (options.media) {
            await this.bot.api.sendPhoto(chatId, options.media, {
              caption: text,
              reply_markup: options.keyboard,
            });
          }
          break;
        case MessageType.VIDEO:
          if (options.media) {
            await this.bot.api.sendVideo(chatId, options.media, {
              caption: text,
              reply_markup: options.keyboard,
            });
          }
          break;
        case MessageType.DOCUMENT:
          if (options.media) {
            await this.bot.api.sendDocument(chatId, options.media, {
              caption: text,
              reply_markup: options.keyboard,
            });
          }
          break;
        case MessageType.AUDIO:
          if (options.media) {
            await this.bot.api.sendAudio(chatId, options.media, {
              caption: text,
              reply_markup: options.keyboard,
            });
          }
          break;
        default:
          await this.bot.api.sendMessage(chatId, text, {
            reply_markup: options?.keyboard,
          });
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send message to ${telegramId}:`, error);

      if (error.error_code === 403) {
        await this.telegramSubscriberService.update(
          { telegramId },
          {
            isBlocked: true,
          }
        );
      }

      return { success: false, error: error.message };
    }
  }

  getBot(): Bot {
    return this.bot;
  }
}