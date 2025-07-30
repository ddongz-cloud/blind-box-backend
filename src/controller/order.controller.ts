import { Controller, Post, Inject, MidwayHttpError, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { OrderService } from '../service/order.service';
import { CreateOrderDto } from '../dto/order.dto';

@Controller('/api/orders')
export class OrderController {
  @Inject()
  orderService!: OrderService;

  @Inject()
  jwtService!: JwtService;

  @Inject()
  ctx!: Context;

  @Post('/')
  async createOrder(@Body() dto: CreateOrderDto) {
    try {
      console.log('创建订单请求，数据:', dto);
      
      // JWT认证验证
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('创建订单请求，用户:', payload);

      // 调用服务创建订单
      const result = await this.orderService.createOrder(payload.id, dto);

      return {
        success: true,
        data: result,
        message: '订单创建成功'
      };
    } catch (error) {
      console.error('创建订单错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') || 
          (error as any).message?.includes('积分不足')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }
}
