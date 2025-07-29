import { Controller, Get } from '@midwayjs/core';

@Controller('/api/test')
export class TestController {
  @Get('/ping')
  async ping() {
    return {
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString()
    };
  }
}
