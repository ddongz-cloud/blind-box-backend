import { Controller, Post, Get, Del, Inject, MidwayHttpError, Body, Param, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { PlayerShowService } from '../service/player-show.service';
import { CreatePlayerShowDto, GetPlayerShowListDto } from '../dto/player-show.dto';

@Controller('/api/player-shows')
export class PlayerShowController {
  @Inject()
  playerShowService!: PlayerShowService;

  @Inject()
  jwtService!: JwtService;

  @Inject()
  ctx!: Context;

  @Post('/')
  async create(@Body() dto: CreatePlayerShowDto) {
    try {
      console.log('发布玩家秀请求，数据:', dto);
      
      // JWT认证验证
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('发布玩家秀请求，用户:', payload);

      // 调用服务创建玩家秀
      const result = await this.playerShowService.createPlayerShow(payload.id, dto);

      return {
        success: true,
        data: result,
        message: '发布成功'
      };
    } catch (error) {
      console.error('发布玩家秀错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') || 
          (error as any).message?.includes('不属于')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Get('/')
  async getList(@Query() query: GetPlayerShowListDto) {
    try {
      console.log('获取玩家秀列表请求，查询参数:', query);
      
      // 调用服务获取列表
      const result = await this.playerShowService.getPlayerShowList(query);

      return {
        success: true,
        data: result,
        message: '获取成功'
      };
    } catch (error) {
      console.error('获取玩家秀列表错误:', error);
      throw new MidwayHttpError('获取列表失败', 500);
    }
  }

  @Get('/:showId')
  async getDetail(@Param('showId') showId: string) {
    try {
      console.log('获取玩家秀详情请求，ID:', showId);
      
      // 尝试获取当前用户ID（可选的登录状态）
      let userId: string | undefined;
      try {
        const authorization = this.ctx.headers.authorization;
        if (authorization) {
          const parts = authorization.split(' ');
          if (parts.length === 2 && parts[0] === 'Bearer') {
            const token = parts[1];
            const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
            userId = payload.id;
            console.log('获取玩家秀详情请求，已登录用户:', payload.username);
          }
        }
      } catch (error) {
        // 忽略JWT验证错误，允许未登录用户访问
        console.log('未登录用户访问玩家秀详情');
      }

      // 调用服务获取详情
      const result = await this.playerShowService.getPlayerShowDetail(showId, userId);

      return {
        success: true,
        data: result,
        message: '获取成功'
      };
    } catch (error) {
      console.error('获取玩家秀详情错误:', error);
      if ((error as any).message?.includes('不存在')) {
        throw error;
      }
      throw new MidwayHttpError('获取详情失败', 500);
    }
  }

  @Post('/:showId/like')
  async toggleLike(@Param('showId') showId: string) {
    try {
      console.log('点赞/取消点赞请求，玩家秀ID:', showId);
      
      // JWT认证验证
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('点赞/取消点赞请求，用户:', payload);

      // 调用服务切换点赞状态
      const result = await this.playerShowService.toggleLike(payload.id, showId);

      return {
        success: true,
        data: result,
        message: '操作成功'
      };
    } catch (error) {
      console.error('点赞/取消点赞错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Del('/:showId')
  async remove(@Param('showId') showId: string) {
    try {
      console.log('删除玩家秀请求，ID:', showId);
      
      // JWT认证验证
      const authorization = this.ctx.headers.authorization;
      if (!authorization) {
        throw new MidwayHttpError('缺少认证令牌', 401);
      }

      const parts = authorization.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new MidwayHttpError('认证令牌格式错误', 401);
      }

      const token = parts[1];
      const payload = await this.jwtService.verify(token) as unknown as { id: string; username: string };
      console.log('删除玩家秀请求，用户:', payload);

      // 调用服务删除玩家秀
      const result = await this.playerShowService.deletePlayerShow(payload.id, showId);

      return {
        success: true,
        data: result,
        message: result.message
      };
    } catch (error) {
      console.error('删除玩家秀错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') || 
          (error as any).message?.includes('无权删除')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }
}
