import { Framework } from '@midwayjs/koa';
import { createApp, close } from '@midwayjs/mock';

async function bootstrap() {
  try {
    const app = await createApp<Framework>();
    console.log('✅ 应用启动成功');

    // 监听进程退出
    process.on('SIGTERM', async () => {
      await close(app);
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      await close(app);
      process.exit(0);
    });

  } catch (err: any) {
    console.error('❌ 应用启动失败:', err);
    process.exit(1);
  }
}

bootstrap();
