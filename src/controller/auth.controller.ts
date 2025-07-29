import { Controller, Post, Body, Inject, Get } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { UserService } from '../service/user.service';
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
}
