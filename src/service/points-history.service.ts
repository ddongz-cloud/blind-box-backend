import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PointsHistory, PointsTransactionType } from '../entity/points-history.entity';
import { User } from '../entity/user.entity';

@Provide()
export class PointsHistoryService {
  @InjectEntityModel(PointsHistory)
  pointsHistoryRepository!: Repository<PointsHistory>;

  @InjectEntityModel(User)
  userRepository!: Repository<User>;

  /**
   * 创建积分记录
   */
  async createPointsRecord(
    userId: string,
    type: PointsTransactionType,
    amount: number,
    description: string,
    relatedOrderId?: string
  ): Promise<PointsHistory> {
    // 获取用户当前积分
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 计算变动后的余额
    const balanceAfter = type === PointsTransactionType.EARN 
      ? user.points + amount 
      : user.points - amount;

    // 创建积分记录
    const pointsRecord = this.pointsHistoryRepository.create({
      userId,
      type,
      amount: type === PointsTransactionType.SPEND ? -Math.abs(amount) : Math.abs(amount),
      balanceAfter,
      description,
      relatedOrderId
    });

    return await this.pointsHistoryRepository.save(pointsRecord);
  }

  /**
   * 获取用户积分记录
   */
  async getUserPointsHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    records: PointsHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [records, total] = await this.pointsHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      records,
      total,
      page,
      limit
    };
  }

  /**
   * 记录购买盲盒的积分消费
   */
  async recordPurchaseSpend(
    userId: string,
    amount: number,
    seriesName: string,
    orderId: string
  ): Promise<PointsHistory> {
    return await this.createPointsRecord(
      userId,
      PointsTransactionType.SPEND,
      amount,
      `购买盲盒：${seriesName}`,
      orderId
    );
  }

  /**
   * 记录积分获得
   */
  async recordPointsEarn(
    userId: string,
    amount: number,
    description: string
  ): Promise<PointsHistory> {
    return await this.createPointsRecord(
      userId,
      PointsTransactionType.EARN,
      amount,
      description
    );
  }
}
