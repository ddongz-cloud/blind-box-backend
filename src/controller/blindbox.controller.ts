import { Controller, Get, Inject, MidwayHttpError, Query, Param } from '@midwayjs/core';
import { BlindBoxService } from '../service/blindbox.service';

@Controller('/api/blindbox')
export class BlindBoxController {
  @Inject()
  blindBoxService!: BlindBoxService;

  @Get('/series')
  async getSeriesList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
    @Query('category') category?: string
  ) {
    try {
      console.log('获取系列列表请求，参数:', { page, limit, category });
      
      const result = await this.blindBoxService.getSeriesList({
        page,
        limit,
        category
      });
      
      return {
        success: true,
        data: result,
        message: '获取系列列表成功'
      };
    } catch (error) {
      console.error('获取系列列表错误:', error);
      throw new MidwayHttpError((error as any).message || '获取系列列表失败', 500);
    }
  }

  @Get('/series/:id')
  async getSeriesDetail(@Param('id') id: string) {
    try {
      console.log('获取系列详情请求，ID:', id);
      
      const series = await this.blindBoxService.getSeriesDetail(id);
      
      return {
        success: true,
        data: series,
        message: '获取系列详情成功'
      };
    } catch (error) {
      console.error('获取系列详情错误:', error);
      if ((error as any).message?.includes('不存在')) {
        throw error; // 重新抛出404错误
      }
      throw new MidwayHttpError((error as any).message || '获取系列详情失败', 500);
    }
  }

  @Get('/search')
  async searchSeries(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12
  ) {
    try {
      console.log('搜索系列请求，参数:', { keyword, page, limit });
      
      const result = await this.blindBoxService.searchSeries({
        keyword,
        page,
        limit
      });
      
      return {
        success: true,
        data: result,
        message: '搜索系列成功'
      };
    } catch (error) {
      console.error('搜索系列错误:', error);
      if ((error as any).message?.includes('关键词')) {
        throw error; // 重新抛出400错误
      }
      throw new MidwayHttpError((error as any).message || '搜索系列失败', 500);
    }
  }

  @Get('/popular')
  async getPopularSeries(@Query('limit') limit: number = 10) {
    try {
      console.log('获取热门系列请求，limit:', limit);
      
      const series = await this.blindBoxService.getPopularSeries(limit);
      
      return {
        success: true,
        data: series,
        message: '获取热门系列成功'
      };
    } catch (error) {
      console.error('获取热门系列错误:', error);
      throw new MidwayHttpError((error as any).message || '获取热门系列失败', 500);
    }
  }
}
