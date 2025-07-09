import { Injectable } from '@nestjs/common';
import * as st from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { CommonService } from '@telegram_broadcast_service/shared/src/sequelize/common.service';
import { FilterService } from '@telegram_broadcast_service/shared/src/sequelize/filter.service';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

import { telegramSubscriberDto } from '@telegram_broadcast_service/src/telegram/subscriber/dto';
import { TelegramSubscriber } from '@telegram_broadcast_service/service/src/model/telegram_subscriber/telegram_subscriber';

@Injectable()
export class TelegramSubscriberService extends CommonService<
  TelegramSubscriber,
  telegramSubscriberDto.inputs.CreateTelegramSubscriberInput,
  telegramSubscriberDto.inputs.FilterTelegramSubscriberInput,
  telegramSubscriberDto.inputs.UpdateTelegramSubscriberInput,
  telegramSubscriberDto.outputs.TelegramSubscriberEntity
> {

  constructor(
    @st.InjectModel(TelegramSubscriber)
    private readonly telegramSubscriberModel: typeof TelegramSubscriber,
    private readonly paginateService: FilterService,
    private readonly configService: ConfigService,
  ) {
    super({ model: telegramSubscriberModel, paginateService });
  }

  async findByTelegramId(telegramId: string): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity | null> {
    return await this.findOne({ telegramId });
  }

  async getActiveSubscribers(targetTags?: string[]): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity[]> {
    const filter = {
      filterMeta: {
        isActive: true,
        isBlocked: false,
      },
    };

    if (targetTags && targetTags.length > 0) {
      filter.filterMeta.tags = { [Op.overlap]: targetTags };
    }

    const result = await this.findAll(filter);
    return result.data;
  }

  async addTags(telegramId: string, tags: string[]): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity | null> {
    const subscriber = await this.findByTelegramId(telegramId);

    if (subscriber) {
      const currentTags = subscriber.tags || [];
      const newTags = [...new Set([...currentTags, ...tags])];

      return await this.update(
        { telegramId },
        { tags: newTags },
      );
    }

    return null;
  }

  async removeTags(telegramId: string, tags: string[]): Promise<telegramSubscriberDto.outputs.TelegramSubscriberEntity | null> {
    const subscriber = await this.findByTelegramId(telegramId);

    if (subscriber) {
      const currentTags = subscriber.tags || [];
      const newTags = currentTags.filter((tag: string) => !tags.includes(tag));

      return await this.update(
        { telegramId },
        { tags: newTags },
      );
    }

    return null;
  }

  async getSubscriberStats(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    blockedSubscribers: number;
    subscribersByTags: Record<string, number>;
  }> {
    const [totalResult, activeResult, blockedResult] = await Promise.all([
      this.findAll({ queryMeta: { paginate: false } }),
      this.findAll({
        filterMeta: { isActive: true },
        queryMeta: { paginate: false }
      }),
      this.findAll({
        filterMeta: { isBlocked: true },
        queryMeta: { paginate: false }
      }),
    ]);

    const subscribersByTags: Record<string, number> = {};
    activeResult.data.forEach(subscriber => {
      subscriber.tags?.forEach((tag: string) => {
        subscribersByTags[tag] = (subscribersByTags[tag] || 0) + 1;
      });
    });

    return {
      totalSubscribers: totalResult.data.length,
      activeSubscribers: activeResult.data.length,
      blockedSubscribers: blockedResult.data.length,
      subscribersByTags,
    };
  }
}