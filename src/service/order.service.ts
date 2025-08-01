import { Provide, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel, InjectDataSource } from '@midwayjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from '../entity/order.entity';
import { BlindBoxSeries } from '../entity/blind-box-series.entity';
import { BlindBoxItem } from '../entity/blind-box-item.entity';
import { UserInventory } from '../entity/user-inventory.entity';
import { User } from '../entity/user.entity';
import { CreateOrderDto } from '../dto/order.dto';
import { PointsHistoryService } from './points-history.service';

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
}

export interface DrawResult {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: string;
  dropRate: number;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  id: string;
  orderNumber: string;
  userId: string;
  seriesId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  series: any;
  resultItems: any[];
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

@Provide()
export class OrderService {
  @InjectEntityModel(Order)
  orderRepository!: Repository<Order>;

  @InjectEntityModel(BlindBoxSeries)
  seriesRepository!: Repository<BlindBoxSeries>;

  @InjectEntityModel(BlindBoxItem)
  itemRepository!: Repository<BlindBoxItem>;

  @InjectEntityModel(UserInventory)
  inventoryRepository!: Repository<UserInventory>;

  @InjectEntityModel(User)
  userRepository!: Repository<User>;

  @InjectDataSource()
  dataSource!: DataSource;

  @Inject()
  pointsHistoryService!: PointsHistoryService;

  async createOrder(userId: string, dto: CreateOrderDto): Promise<CreateOrderResponse> {
    console.log('OrderService.createOrder called with:', { userId, dto });

    // 1. 验证系列是否存在
    const series = await this.seriesRepository.findOne({
      where: { id: dto.seriesId, isActive: true }
    });

    if (!series) {
      throw new MidwayHttpError('盲盒系列不存在', 404);
    }

    console.log('Found series:', series.name, 'Price:', series.price);

    // 2. 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new MidwayHttpError('用户不存在', 404);
    }

    console.log('Found user:', user.username, 'Points:', user.points);

    // 3. 计算订单总金额
    const totalAmount = Number(series.price) * dto.quantity;
    console.log('Calculated total amount:', totalAmount);

    // 4. 检查用户积分是否足够（使用积分支付）
    if (user.points < totalAmount) {
      throw new MidwayHttpError(`积分不足，需要${totalAmount}积分，当前只有${user.points}积分`, 400);
    }

    // 5. 生成订单号
    const orderNumber = this.generateOrderNumber();
    console.log('Generated order number:', orderNumber);

    // 6. 创建订单
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      seriesId: dto.seriesId,
      quantity: dto.quantity,
      unitPrice: Number(series.price),
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.POINTS
    });

    const savedOrder = await this.orderRepository.save(order);
    console.log('Order saved with ID:', savedOrder.id);

    // 7. 订单创建成功，不立即扣除积分（等待支付）
    console.log('Order created successfully, waiting for payment');

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      totalAmount: savedOrder.totalAmount,
      status: savedOrder.status
    };
  }

  async executeDraw(userId: string, orderId: string): Promise<DrawResult[]> {
    console.log('OrderService.executeDraw called with:', { userId, orderId });

    // 1. 查找订单并预加载关联数据
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['series', 'series.items']
    });

    // 2. 前置校验
    if (!order) {
      throw new MidwayHttpError('订单不存在', 404);
    }

    if (order.userId !== userId) {
      throw new MidwayHttpError('无权访问此订单', 403);
    }

    if (order.status !== OrderStatus.PAID) {
      throw new MidwayHttpError('订单未支付或已完成，无法抽取', 400);
    }

    if (!order.series || !order.series.items || order.series.items.length === 0) {
      throw new MidwayHttpError('该系列暂无可抽取物品', 400);
    }

    console.log('Order validation passed, series:', order.series.name, 'items count:', order.series.items.length);

    // 3. 过滤活跃物品
    const activeItems = order.series.items.filter(item => item.isActive);
    if (activeItems.length === 0) {
      throw new MidwayHttpError('该系列暂无可抽取物品', 400);
    }

    // 4. 执行抽取
    const drawnItems: BlindBoxItem[] = [];
    for (let i = 0; i < order.quantity; i++) {
      const drawnItem = this._weightedRandomDraw(activeItems);
      drawnItems.push(drawnItem);
    }

    console.log('Draw completed, items:', drawnItems.map(item => item.name));

    // 5. 使用事务更新库存和订单状态
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 更新用户库存
      for (const item of drawnItems) {
        const existingInventory = await queryRunner.manager.findOne(UserInventory, {
          where: { userId, itemId: item.id }
        });

        if (existingInventory) {
          // 已拥有该物品，增加数量
          await queryRunner.manager.update(UserInventory,
            { userId, itemId: item.id },
            { quantity: existingInventory.quantity + 1, obtainMethod: 'blind_box_draw' }
          );
        } else {
          // 新获得物品，创建记录
          const newInventory = queryRunner.manager.create(UserInventory, {
            userId,
            itemId: item.id,
            quantity: 1,
            obtainMethod: 'blind_box_draw'
          });
          await queryRunner.manager.save(newInventory);
        }

        // 更新物品获得次数
        await queryRunner.manager.update(BlindBoxItem,
          { id: item.id },
          { obtainedCount: () => 'obtainedCount + 1' }
        );
      }

      // 更新订单状态
      await queryRunner.manager.update(Order,
        { id: orderId },
        {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
          resultItems: JSON.stringify(drawnItems.map(item => ({
            id: item.id,
            name: item.name,
            rarity: item.rarity
          })))
        }
      );

      await queryRunner.commitTransaction();
      console.log('Transaction committed successfully');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed, rolling back:', error);
      throw new MidwayHttpError('抽取失败，请重试', 500);
    } finally {
      await queryRunner.release();
    }

    // 6. 返回抽取结果
    return drawnItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      rarity: item.rarity,
      dropRate: Number(item.dropRate)
    }));
  }

  private _weightedRandomDraw(items: BlindBoxItem[]): BlindBoxItem {
    // 计算总概率
    const totalProbability = items.reduce((sum, item) => sum + Number(item.dropRate), 0);

    if (totalProbability <= 0) {
      throw new MidwayHttpError('物品概率配置错误', 500);
    }

    // 生成随机数
    const random = Math.random() * totalProbability;

    // 累加概率查找
    let cumulativeProbability = 0;
    for (const item of items) {
      cumulativeProbability += Number(item.dropRate);
      if (random <= cumulativeProbability) {
        return item;
      }
    }

    // 兜底返回最后一个物品
    return items[items.length - 1];
  }

  async getOrderList(userId: string, query: OrderQueryParams): Promise<OrderListResponse> {
    console.log('OrderService.getOrderList called with:', { userId, query });

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const whereCondition: any = { userId };

    // 如果指定了状态，添加到查询条件中
    if (query.status) {
      whereCondition.status = query.status;
    }

    // 执行分页查询，预加载系列信息
    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereCondition,
      relations: ['series'],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC' // 按创建时间倒序排列
      }
    });

    console.log(`Found ${orders.length} orders for user ${userId}`);

    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async getOrderDetail(userId: string, orderId: string): Promise<OrderDetailResponse> {
    console.log('OrderService.getOrderDetail called with:', { userId, orderId });

    // 查找订单并预加载系列信息
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['series']
    });

    // 安全检查
    if (!order) {
      throw new MidwayHttpError('订单不存在', 404);
    }

    // 权限检查
    if (order.userId !== userId) {
      throw new MidwayHttpError('无权查看他人订单', 403);
    }

    console.log('Order found:', order.orderNumber, 'Status:', order.status);

    // 查找与该订单相关的抽取结果
    let resultItems: any[] = [];

    // 如果订单已完成，查找用户库存中与此订单相关的物品
    if (order.status === OrderStatus.COMPLETED && order.resultItems) {
      try {
        // 解析存储在订单中的抽取结果
        const storedResults = JSON.parse(order.resultItems);

        // 根据物品ID查找详细信息
        if (storedResults && Array.isArray(storedResults)) {
          const itemIds = storedResults.map((item: any) => item.id);
          if (itemIds.length > 0) {
            const items = await this.itemRepository.find({
              where: itemIds.map(id => ({ id }))
            });

            // 组装结果，包含数量信息
            resultItems = storedResults.map((storedItem: any) => {
              const fullItem = items.find(item => item.id === storedItem.id);
              return {
                ...fullItem,
                obtainedQuantity: storedResults.filter((r: any) => r.id === storedItem.id).length
              };
            });
          }
        }
      } catch (error) {
        console.error('Error parsing result items:', error);
        resultItems = [];
      }
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      seriesId: order.seriesId,
      quantity: order.quantity,
      unitPrice: Number(order.unitPrice),
      totalAmount: Number(order.totalAmount),
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,
      series: order.series,
      resultItems
    };
  }

  async cancelOrder(userId: string, orderId: string): Promise<{ message: string }> {
    console.log('OrderService.cancelOrder called with:', { userId, orderId });

    // 查找订单
    const order = await this.orderRepository.findOne({
      where: { id: orderId }
    });

    // 安全检查
    if (!order) {
      throw new MidwayHttpError('订单不存在', 404);
    }

    // 权限检查
    if (order.userId !== userId) {
      throw new MidwayHttpError('无权操作他人订单', 403);
    }

    // 业务逻辑检查：只有待处理状态的订单才能取消
    if (order.status !== OrderStatus.PENDING) {
      throw new MidwayHttpError('订单状态不允许取消', 400);
    }

    // 更新订单状态为已取消
    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    console.log(`Order ${orderId} cancelled successfully`);

    return {
      message: '订单取消成功'
    };
  }

  async payOrder(userId: string, orderId: string): Promise<{ message: string; orderId: string }> {
    console.log('OrderService.payOrder called with:', { userId, orderId });

    // 查找订单并预加载系列信息
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['series']
    });

    // 安全检查
    if (!order) {
      throw new MidwayHttpError('订单不存在', 404);
    }

    // 权限检查
    if (order.userId !== userId) {
      throw new MidwayHttpError('无权操作他人订单', 403);
    }

    // 业务逻辑检查：只有待处理状态的订单才能支付
    if (order.status !== OrderStatus.PENDING) {
      throw new MidwayHttpError('订单状态不允许支付', 400);
    }

    // 获取用户信息检查积分
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new MidwayHttpError('用户不存在', 404);
    }

    // 检查用户积分是否足够
    if (user.points < order.totalAmount) {
      throw new MidwayHttpError(`积分不足，需要${order.totalAmount}积分，当前只有${user.points}积分`, 400);
    }

    // 使用事务处理支付
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 扣除用户积分
      await queryRunner.manager.update('users', { id: userId }, {
        points: user.points - order.totalAmount
      });

      // 更新订单状态为已支付
      await queryRunner.manager.update('orders', { id: orderId }, {
        status: OrderStatus.PAID,
        paidAt: new Date()
      });

      // 记录积分消费记录
      await this.pointsHistoryService.recordPurchaseSpend(
        userId,
        order.totalAmount,
        order.series.name,
        orderId
      );

      await queryRunner.commitTransaction();
      console.log(`Order ${orderId} paid successfully`);

      return {
        message: '支付成功',
        orderId: orderId
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Payment failed:', error);
      throw new MidwayHttpError('支付失败', 500);
    } finally {
      await queryRunner.release();
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }
}
