import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as crossDomain from '@midwayjs/cross-domain';
import * as staticFile from '@midwayjs/static-file';
import * as swagger from '@midwayjs/swagger';
import * as typeorm from '@midwayjs/typeorm';
import * as jwt from '@midwayjs/jwt';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    validate,
    info,
    crossDomain,
    staticFile,
    swagger,
    typeorm,
    jwt,
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
