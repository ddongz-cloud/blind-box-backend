import { Controller, Get, Put, Post, Inject, MidwayHttpError, Body, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { UserService } from '../service/user.service';
import { UpdateProfileDto } from '../dto/user.dto';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService!: UserService;

  @Inject()
  jwtService!: JwtService;

  @Inject()
  ctx!: Context;

  @Get('/profile')
  async getProfile() {
    try {
      // 获取Authorization头
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      // 检查Bearer格式
      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];
      
      // 验证JWT token并获取用户信息
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('获取个人信息请求，用户:', payload);
      
      // 调用UserService获取用户详细信息
      const userProfile = await this.userService.getProfile(payload.id);
      
      return {
        success: true,
        data: userProfile,
        message: '获取个人信息成功'
      };
    } catch (error) {
      console.error('获取个人信息错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error; // 重新抛出认证相关错误
      }
      if ((error as any).message?.includes('用户不存在')) {
        throw error; // 重新抛出用户不存在错误
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Put('/profile')
  async updateProfile(@Body() dto: UpdateProfileDto) {
    try {
      // 获取Authorization头
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      // 检查Bearer格式
      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];

      // 验证JWT token并获取用户信息
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('更新个人信息请求，用户:', payload);

      // 调用UserService更新用户信息
      const updatedProfile = await this.userService.updateProfile(payload.id, dto);

      return {
        success: true,
        data: updatedProfile,
        message: '个人信息更新成功'
      };
    } catch (error) {
      console.error('更新个人信息错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error; // 重新抛出认证相关错误
      }
      if ((error as any).message?.includes('用户不存在')) {
        throw error; // 重新抛出用户不存在错误
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Get('/points')
  async getPointsHistory(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    try {
      // 获取Authorization头
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      // 检查Bearer格式
      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];

      // 验证JWT token并获取用户信息
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('获取积分记录请求，用户:', payload, '分页参数:', { page, limit });

      // 调用UserService获取积分记录
      const pointsHistory = await this.userService.getPointsHistory(payload.id, page, limit);

      return pointsHistory;
    } catch (error) {
      console.error('获取积分记录错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error; // 重新抛出认证相关错误
      }
      if ((error as any).message?.includes('用户不存在')) {
        throw error; // 重新抛出用户不存在错误
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Post('/add-points')
  async addPoints(@Body() body: { amount: number }) {
    try {
      // 获取Authorization头
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      // 检查Bearer格式
      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];

      // 验证JWT token并获取用户信息
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('增加积分请求，用户:', payload, '金额:', body.amount);

      // 调用UserService增加积分
      const result = await this.userService.addPoints(payload.id, body.amount);

      return {
        success: true,
        data: result,
        message: '积分增加成功'
      };
    } catch (error) {
      console.error('增加积分错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error; // 重新抛出认证相关错误
      }
      if ((error as any).message?.includes('用户不存在')) {
        throw error; // 重新抛出用户不存在错误
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }
}
