import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as crossDomain from '@midwayjs/cross-domain';
import * as typeorm from '@midwayjs/typeorm';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    validate,
    crossDomain,
    typeorm,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app!: koa.Application;

  async onReady() {
    // 应用启动完成
    console.log('🚀 盲盒抽盒机后端服务启动成功');
  }
}
