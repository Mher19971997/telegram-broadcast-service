import { Injectable } from '@nestjs/common';
import * as st from '@nestjs/sequelize';

import { CommonService } from '@telegram_broadcast_service/shared/src/sequelize/common.service';
import { FilterService } from '@telegram_broadcast_service/shared/src/sequelize/filter.service';
import { ConfigService } from '@telegram_broadcast_service/shared/src/config/config.service';

import { broadcastJobDto } from '@telegram_broadcast_service/src/broadcast/broadcast.job/dto';
import { BroadcastJob, JobStatus } from '@telegram_broadcast_service/service/src/model/broadcast-job/broadcast-job';

@Injectable()
export class BroadcastJobService extends CommonService<
  BroadcastJob,
  broadcastJobDto.inputs.CreateBroadcastJobInput,
  broadcastJobDto.inputs.FilterBroadcastJobInput,
  broadcastJobDto.inputs.UpdateBroadcastJobInput,
  broadcastJobDto.outputs.BroadcastJobEntity
> {

  constructor(
    @st.InjectModel(BroadcastJob)
    private readonly broadcastJobModel: typeof BroadcastJob,
    private readonly paginateService: FilterService,
    private readonly configService: ConfigService,
  ) {
    super({ model: broadcastJobModel, paginateService });
  }

  async getJobWithMessage(
    jobId: string,
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity | null> {
    return await this.findOne({
      filterMeta: { uuid: jobId },
      includeMeta: [{
        association: 'message',
        required: false,
      }],
    });
  }

  async updateProgress(
    jobId: string,
    progressData: {
      sentCount?: number;
      failedCount?: number;
      blockedCount?: number;
      progressPercent?: number;
      errors?: any[];
    },
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity | null> {
    return await this.update(
      {
        uuid: jobId,
      },
      progressData
    );
  }

  async startJob(
    jobId: string,
    totalUsers: number,
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity | null> {
    return await this.update(
      { uuid: jobId },
      {
        status: JobStatus.IN_PROGRESS,
        totalUsers,
        startedAt: new Date(),
      },
    );
  }

  async completeJob(
    jobId: string,
    finalStats: {
      sentCount: number;
      failedCount: number;
      blockedCount: number;
      errors?: any[];
    },
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity | null> {
    return await this.update(
      { uuid: jobId },
      {
        status: JobStatus.COMPLETED,
        ...finalStats,
        progressPercent: 100,
        completedAt: new Date(),
      },
    );
  }

  async failJob(
    jobId: string,
    error: string,
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity | null> {
    return await this.update(
      { uuid: jobId },
      {
        status: JobStatus.FAILED,
        errors: [{ error }],
        completedAt: new Date(),
      },
    );
  }

  async getJobsByStatus(
    status: JobStatus,
    userOrTxn?: any
  ): Promise<broadcastJobDto.outputs.BroadcastJobEntity[]> {
    const result = await this.findAll({
      filterMeta: { status },
      includeMeta: [{
        association: 'message',
        required: false,
      }],
      queryMeta: {
        order: { createdAt: 'desc' },
        paginate: false,
      },
    });

    return result.data;
  }

  async getRecentJobs(limit = 10): Promise<broadcastJobDto.outputs.BroadcastJobEntity[]> {
    const result = await this.findAll({
      includeMeta: [{
        association: 'message',
        required: false,
      }],
      queryMeta: {
        order: { createdAt: 'desc' },
        limit,
        paginate: false,
      },
    });

    return result.data;
  }

  async cleanupOldJobs(daysOld = 30, userOrTxn?: any): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldJobs = await this.findAll({
      filterMeta: {
        createdAt: { lt: cutoffDate },
        status: { in: [JobStatus.COMPLETED, JobStatus.FAILED] },
      },
      queryMeta: { paginate: false },
    } as any, userOrTxn);

    let deletedCount = 0;
    for (const job of oldJobs.data) {
      await this.remove({ filterMeta: { uuid: job.uuid } } as any, userOrTxn);
      deletedCount++;
    }

    return deletedCount;
  }
}