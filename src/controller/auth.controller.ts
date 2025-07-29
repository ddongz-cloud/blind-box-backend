import { Controller, Post, Body, Inject, Get, MidwayHttpError } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { UserService, LoginUserDto } from '../service/user.service';
import { RegisterDto } from '../dto/auth.dto';

@Controller('/api/auth')
export class AuthController {
  @Inject()
  userService!: UserService;

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
      return {
        success: false,
        message: (error as any).message || '注册失败'
      };
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
}
