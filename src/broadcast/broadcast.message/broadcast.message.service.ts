import { Injectable } from '@nestjs/common';
import * as st from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { CommonService } from '@telegram_broadcast_service/shared/src/sequelize/common.service';
import { FilterService } from '@telegram_broadcast_service/shared/src/sequelize/filter.service';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

import { broadcastMessageDto } from '@telegram_broadcast_service/src/broadcast/broadcast.message/dto';
import { BroadcastJobService } from '@telegram_broadcast_service/src/broadcast/broadcast.job/broadcast.job.service';
import { BroadcastMessage } from '@telegram_broadcast_service/service/src/model/broadcast_messages/broadcast_message';
import { constants } from '@telegram_broadcast_service/shared/src/config/constants';
import { JobStatus } from '@telegram_broadcast_service/service/src/model/broadcast-job/broadcast-job';

@Injectable()
export class BroadcastMessageService extends CommonService<
  BroadcastMessage,
  broadcastMessageDto.inputs.CreateBroadcastMessageInput,
  broadcastMessageDto.inputs.FilterBroadcastMessageInput,
  broadcastMessageDto.inputs.UpdateBroadcastMessageInput,
  broadcastMessageDto.outputs.BroadcastMessageEntity
> {

  constructor(
    @st.InjectModel(BroadcastMessage)
    private readonly broadcastMessageModel: typeof BroadcastMessage,
    private readonly paginateService: FilterService,
    private readonly configService: ConfigService,
    private readonly broadcastJobService: BroadcastJobService,
    @InjectQueue(constants.BROADCAST_QUEUE)
    private readonly broadcastQueue: Queue,
  ) {
    super({ model: broadcastMessageModel, paginateService });
  }

  async sendBroadcast(
    messageUuid: string,
    authorId?: string,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity | any> {
    const message = await this.findOne({ uuid: messageUuid });

    if (!message) {
      throw new Error('Message not found');
    }

    const job = await this.broadcastJobService.create({
      messageUuid,
      status: JobStatus.PENDING,
      authorId,
    });

    if (message.isScheduled && message.scheduledAt) {
      const delay = new Date(message.scheduledAt).getTime() - Date.now();
      await this.broadcastQueue.add(
        'send-broadcast',
        {
          messageUuid,
          jobId: job.uuid,
        },
        {
          delay: delay > 0 ? delay : 0,
        }
      );
    } else {
      await this.broadcastQueue.add('send-broadcast', {
        messageUuid,
        jobId: job.uuid,
      });
    }

    return job;
  }

  async getMessagesWithJobs(): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity[]> {
    const result = await this.findAll({
      includeMeta: [
        {
          association: 'jobs',
          required: false,
        }
      ],
      queryMeta: {
        order: { createdAt: 'desc' },
        paginate: false,
      },
    });
    return result.data;
  }

  async scheduleMessage(
    messageId: string,
    scheduledAt: Date,
  ): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity | null> {
    return await this.update(
      { uuid: messageId },
      {
        isScheduled: true,
        scheduledAt,
      },
    );
  }

  async cancelScheduledMessage(messageId: string): Promise<broadcastMessageDto.outputs.BroadcastMessageEntity | null> {
    return await this.update(
      { uuid: messageId },
      {
        isScheduled: false,
        scheduledAt: null,
      },
    );
  }
}