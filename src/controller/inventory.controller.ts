import { Controller, Get, Put, Inject, MidwayHttpError, Body, Param, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { InventoryService } from '../service/inventory.service';
import { UpdateFavoriteDto, UpdateDisplayDto, GetInventoryQueryDto } from '../dto/inventory.dto';

@Controller('/api/inventory')
export class InventoryController {
  @Inject()
  inventoryService!: InventoryService;

  @Inject()
  jwtService!: JwtService;

  @Inject()
  ctx!: Context;

  @Get('/')
  async getInventory(@Query() query: GetInventoryQueryDto) {
    try {
      console.log('获取库存列表请求，查询参数:', query);
      
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
      console.log('获取库存列表请求，用户:', payload);

      // 调用服务获取库存列表
      const result = await this.inventoryService.getInventoryList(payload.id, query);

      return {
        success: true,
        data: result,
        message: '获取库存列表成功'
      };
    } catch (error) {
      console.error('获取库存列表错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Put('/:inventoryId/favorite')
  async updateFavorite(@Param('inventoryId') inventoryId: string, @Body() dto: UpdateFavoriteDto) {
    try {
      console.log('更新收藏状态请求，库存ID:', inventoryId, '数据:', dto);
      
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
      console.log('更新收藏状态请求，用户:', payload);

      // 调用服务更新收藏状态
      const result = await this.inventoryService.updateFavoriteStatus(payload.id, inventoryId, dto);

      return {
        success: true,
        data: result,
        message: '操作成功'
      };
    } catch (error) {
      console.error('更新收藏状态错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') || 
          (error as any).message?.includes('无权操作')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }

  @Put('/:inventoryId/display')
  async updateDisplay(@Param('inventoryId') inventoryId: string, @Body() dto: UpdateDisplayDto) {
    try {
      console.log('更新展示状态请求，库存ID:', inventoryId, '数据:', dto);
      
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
      console.log('更新展示状态请求，用户:', payload);

      // 调用服务更新展示状态
      const result = await this.inventoryService.updateDisplayStatus(payload.id, inventoryId, dto);

      return {
        success: true,
        data: result,
        message: '操作成功'
      };
    } catch (error) {
      console.error('更新展示状态错误:', error);
      if ((error as any).message?.includes('令牌')) {
        throw error;
      }
      if ((error as any).message?.includes('不存在') || 
          (error as any).message?.includes('无权操作')) {
        throw error;
      }
      throw new MidwayHttpError('认证令牌无效或已过期', 401);
    }
  }
}
