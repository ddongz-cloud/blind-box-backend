import { Bootstrap } from '@midwayjs/bootstrap';

async function bootstrap() {
  try {
    const app = await Bootstrap.run();
    console.log('✅ 应用启动成功');

    // 监听进程退出
    process.on('SIGTERM', async () => {
      await app.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      await app.stop();
      process.exit(0);
    });

  } catch (err: any) {
    console.error('❌ 应用启动失败:', err);
    process.exit(1);
  }
}

bootstrap();
