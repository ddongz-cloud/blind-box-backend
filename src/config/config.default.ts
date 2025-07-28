import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export default {
  // 应用基础配置
  keys: process.env.APP_KEYS || 'blind-box-secret-key',
  koa: {
    port: 7001,
  },

  // 跨域配置
  cors: {
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },

  // TypeORM 数据库配置
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../webapp.sqlite'),
        synchronize: true, // 开发环境自动同步表结构
        logging: false,
        entities: [join(__dirname, '../entity/*.entity{.ts,.js}')],
        migrations: [join(__dirname, '../migration/*.ts')],
        subscribers: [join(__dirname, '../subscriber/*.ts')],
      },
    },
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'blind-box-jwt-secret-key',
    expiresIn: '7d',
  },

  // 密码加密配置
  bcrypt: {
    saltRounds: 10,
  },

  // 静态文件配置
  staticFile: {
    dirs: {
      default: {
        prefix: '/public/',
        dir: join(__dirname, '../../public'),
      },
    },
  },

  // Swagger API 文档配置
  swagger: {
    title: '盲盒抽盒机 API',
    description: '盲盒抽盒机后端接口文档',
    version: '1.0.0',
    termsOfService: '',
    contact: {
      name: 'API Support',
      email: 'support@blindbox.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    tags: [
      { name: 'Auth', description: '用户认证相关接口' },
      { name: 'User', description: '用户管理相关接口' },
      { name: 'BlindBox', description: '盲盒相关接口' },
      { name: 'Order', description: '订单相关接口' },
      { name: 'Inventory', description: '库存相关接口' },
      { name: 'PlayerShow', description: '玩家秀相关接口' },
    ],
  },

  // 日志配置
  midwayLogger: {
    default: {
      level: 'info',
      consoleLevel: 'info',
    },
  },

  // 参数验证配置
  validate: {
    validationOptions: {
      allowUnknown: false,
    },
  },

  // 安全配置
  security: {
    csrf: {
      enable: false, // API 项目通常关闭 CSRF
    },
  },

} as MidwayConfig;
