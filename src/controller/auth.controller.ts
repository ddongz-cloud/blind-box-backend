import { Controller, Post, Body, Inject, Get, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { UserService } from '../service/user.service';

@Controller('/api/auth')
export class AuthController {
  @Inject()
  userService!: UserService;

  @Inject()
  jwtService!: JwtService;

  @Inject()
  ctx!: Context;

  @Get('/health')
  async health() {
    return {
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString()
    };
  }

  @Post('/register')
  async register(@Body() registerData: any) {
    try {
      console.log('收到注册请求:', registerData);
      const result = await this.userService.register(registerData);

      return {
        success: true,
        data: result,
        message: '注册成功'
      };
    } catch (error) {
      console.error('注册错误:', error);
      // 抛出HTTP 400错误，保持与登录接口一致
      throw new MidwayHttpError((error as any).message || '注册失败', 400);
    }
  }

  @Post('/login')
  async login(@Body() loginData: any) {
    try {
      console.log('收到登录请求:', loginData);
      const result = await this.userService.login(loginData);

      return {
        success: true,
        data: result,
        message: '登录成功'
      };
    } catch (error) {
      console.error('登录错误:', error);
      // 抛出HTTP 401错误
      throw new MidwayHttpError((error as any).message || '登录失败', 401);
    }
  }

  @Post('/logout')
  async logout() {
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

      // 验证JWT token
      const payload = await this.jwtService.verify(token);
      console.log('用户登出:', payload);

      // JWT登出主要由客户端删除token实现
      // 服务端只需要返回成功响应
      return {
        success: true,
        message: '登出成功'
      };
    } catch (error) {
      console.error('登出错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error; // 重新抛出认证相关错误
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Post('/refresh')
  async refresh() {
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
      console.log('刷新Token请求，用户:', payload);

      // 调用UserService生成新token
      const result = await this.userService.refreshToken(payload);

      return {
        success: true,
        data: result,
        message: 'Token刷新成功'
      };
    } catch (error) {
      console.error('Token刷新错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error; // 重新抛出认证相关错误
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }
}
