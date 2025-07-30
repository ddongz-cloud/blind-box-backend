import { Provide, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentMethod } from '../entity/order.entity';
import { BlindBoxSeries } from '../entity/blind-box-series.entity';
import { User } from '../entity/user.entity';
import { CreateOrderDto } from '../dto/order.dto';

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
}

@Provide()
export class OrderService {
  @InjectEntityModel(Order)
  orderRepository!: Repository<Order>;

  @InjectEntityModel(BlindBoxSeries)
  seriesRepository!: Repository<BlindBoxSeries>;

  @InjectEntityModel(User)
  userRepository!: Repository<User>;

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

    // 7. 扣除用户积分
    await this.userRepository.update(userId, {
      points: user.points - totalAmount
    });
    console.log('User points updated, deducted:', totalAmount);

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      totalAmount: savedOrder.totalAmount,
      status: savedOrder.status
    };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }
}
