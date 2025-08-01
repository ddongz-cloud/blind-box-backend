import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { BlindBoxService } from '../service/blindbox.service';

async function initData() {
  const app = await createApp<Framework>();
  
  try {
    const userService = await app.getApplicationContext().getAsync(UserService);
    const blindBoxService = await app.getApplicationContext().getAsync(BlindBoxService);

    console.log('🚀 开始初始化测试数据...');

    // 创建测试用户
    console.log('📝 创建测试用户...');
    try {
      await userService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: '123456'
      });
      console.log('✅ 测试用户创建成功');
    } catch (error) {
      console.log('ℹ️ 测试用户已存在');
    }

    // 创建管理员用户
    try {
      await userService.register({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('✅ 管理员用户创建成功');
    } catch (error) {
      console.log('ℹ️ 管理员用户已存在');
    }

    // 创建盲盒系列数据
    console.log('🎁 创建盲盒系列数据...');
    
    const seriesData = [
      {
        name: '像素英雄系列',
        description: '经典8位像素风格的英雄角色，重温童年游戏回忆',
        price: 99,
        coverImage: 'https://via.placeholder.com/300x200/4a90e2/ffffff?text=像素英雄',
        category: 'game',
        isActive: true,
        popularity: 95,
        items: [
          {
            name: '勇者',
            description: '手持圣剑的勇敢战士',
            image: 'https://via.placeholder.com/64x64/51cf66/ffffff?text=勇者',
            rarity: 'common',
            probability: 40
          },
          {
            name: '法师',
            description: '掌握魔法的神秘法师',
            image: 'https://via.placeholder.com/64x64/3b82f6/ffffff?text=法师',
            rarity: 'rare',
            probability: 30
          },
          {
            name: '龙骑士',
            description: '骑乘巨龙的传奇骑士',
            image: 'https://via.placeholder.com/64x64/8b5cf6/ffffff?text=龙骑',
            rarity: 'epic',
            probability: 20
          },
          {
            name: '神话英雄',
            description: '传说中的最强英雄',
            image: 'https://via.placeholder.com/64x64/f59e0b/ffffff?text=神话',
            rarity: 'legendary',
            probability: 10
          }
        ]
      },
      {
        name: '可爱动物系列',
        description: '萌萌哒像素动物朋友们',
        price: 79,
        coverImage: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=可爱动物',
        category: 'anime',
        isActive: true,
        popularity: 88,
        items: [
          {
            name: '像素猫咪',
            description: '软萌的小猫咪',
            image: 'https://via.placeholder.com/64x64/6b7280/ffffff?text=猫咪',
            rarity: 'common',
            probability: 45
          },
          {
            name: '像素狗狗',
            description: '忠诚的小狗狗',
            image: 'https://via.placeholder.com/64x64/3b82f6/ffffff?text=狗狗',
            rarity: 'rare',
            probability: 35
          },
          {
            name: '像素熊猫',
            description: '珍贵的大熊猫',
            image: 'https://via.placeholder.com/64x64/8b5cf6/ffffff?text=熊猫',
            rarity: 'epic',
            probability: 15
          },
          {
            name: '独角兽',
            description: '神话中的独角兽',
            image: 'https://via.placeholder.com/64x64/f59e0b/ffffff?text=独角兽',
            rarity: 'legendary',
            probability: 5
          }
        ]
      },
      {
        name: '科幻机甲系列',
        description: '未来科技感十足的机甲战士',
        price: 129,
        coverImage: 'https://via.placeholder.com/300x200/7b68ee/ffffff?text=科幻机甲',
        category: 'game',
        isActive: true,
        popularity: 92,
        items: [
          {
            name: '侦察机甲',
            description: '轻型侦察机甲',
            image: 'https://via.placeholder.com/64x64/6b7280/ffffff?text=侦察',
            rarity: 'common',
            probability: 35
          },
          {
            name: '战斗机甲',
            description: '重型战斗机甲',
            image: 'https://via.placeholder.com/64x64/3b82f6/ffffff?text=战斗',
            rarity: 'rare',
            probability: 30
          },
          {
            name: '指挥官机甲',
            description: '指挥官专用机甲',
            image: 'https://via.placeholder.com/64x64/8b5cf6/ffffff?text=指挥',
            rarity: 'epic',
            probability: 25
          },
          {
            name: '终极机甲',
            description: '最强的终极机甲',
            image: 'https://via.placeholder.com/64x64/f59e0b/ffffff?text=终极',
            rarity: 'legendary',
            probability: 10
          }
        ]
      }
    ];

    for (const series of seriesData) {
      try {
        await blindBoxService.createSeries(series);
        console.log(`✅ 创建系列: ${series.name}`);
      } catch (error) {
        console.log(`ℹ️ 系列已存在: ${series.name}`);
      }
    }

    console.log('🎉 测试数据初始化完成！');
    console.log('📝 测试账户信息:');
    console.log('   用户名: testuser, 密码: 123456');
    console.log('   用户名: admin, 密码: admin123');
    
  } catch (error) {
    console.error('❌ 初始化数据失败:', error);
  } finally {
    await close(app);
  }
}

// 运行初始化 - 注释掉自动运行，改为手动调用
// initData().catch(console.error);
