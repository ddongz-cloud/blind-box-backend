import { Controller, Post, Get, Put, Inject, MidwayHttpError, Body, Param, Query } from '@midwayjs/core';
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

  @Post('/:orderId/draw')
  async executeDraw(@Param('orderId') orderId: string) {
    try {
      console.log('执行抽取请求，订单ID:', orderId);

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
      console.log('执行抽取请求，用户:', payload);

      // 调用服务执行抽取
      const result = await this.orderService.executeDraw(payload.id, orderId);

      return {
        success: true,
        data: result,
        message: '抽取成功'
      };
    } catch (error) {
      console.error('执行抽取错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') ||
          (error as any).message?.includes('无权访问') ||
          (error as any).message?.includes('已完成') ||
          (error as any).message?.includes('暂无可抽取')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Get('/')
  async getOrders(@Query() query: any) {
    try {
      console.log('获取订单列表请求，查询参数:', query);

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
      console.log('获取订单列表请求，用户:', payload);

      // 调用服务获取订单列表
      const result = await this.orderService.getOrderList(payload.id, query);

      return {
        success: true,
        data: result,
        message: '获取订单列表成功'
      };
    } catch (error) {
      console.error('获取订单列表错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Get('/:orderId')
  async getOrderDetail(@Param('orderId') orderId: string) {
    try {
      console.log('获取订单详情请求，订单ID:', orderId);

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
      console.log('获取订单详情请求，用户:', payload);

      // 调用服务获取订单详情
      const result = await this.orderService.getOrderDetail(payload.id, orderId);

      return {
        success: true,
        data: result,
        message: '获取订单详情成功'
      };
    } catch (error) {
      console.error('获取订单详情错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') ||
          (error as any).message?.includes('无权查看')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Put('/:orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    try {
      console.log('取消订单请求，订单ID:', orderId);

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
      console.log('取消订单请求，用户:', payload);

      // 调用服务取消订单
      const result = await this.orderService.cancelOrder(payload.id, orderId);

      return {
        success: true,
        data: result,
        message: result.message
      };
    } catch (error) {
      console.error('取消订单错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') ||
          (error as any).message?.includes('无权操作') ||
          (error as any).message?.includes('不允许取消')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }
}
