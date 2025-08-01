import { Provide, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BlindBoxSeries } from '../entity/blind-box-series.entity';
import { BlindBoxItem } from '../entity/blind-box-item.entity';

export interface SeriesListResponse {
  series: BlindBoxSeries[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SeriesListParams {
  page?: number;
  limit?: number;
  category?: string;
}

export interface SearchSeriesParams {
  keyword: string;
  page?: number;
  limit?: number;
}

@Provide()
export class BlindBoxService {
  @InjectEntityModel(BlindBoxSeries)
  seriesRepository!: Repository<BlindBoxSeries>;

  @InjectEntityModel(BlindBoxItem)
  itemRepository!: Repository<BlindBoxItem>;

  async getSeriesList(params: SeriesListParams): Promise<SeriesListResponse> {
    const { page = 1, limit = 12, category } = params;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const whereCondition: any = { isActive: true };
    if (category) {
      whereCondition.category = category;
    }

    // 执行分页查询
    const [series, total] = await this.seriesRepository.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return {
      series,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  async getSeriesDetail(id: string): Promise<BlindBoxSeries> {
    const series = await this.seriesRepository.findOne({
      where: { id, isActive: true },
      relations: ['items']
    });

    if (!series) {
      throw new MidwayHttpError('盲盒系列不存在', 404);
    }

    return series;
  }

  async searchSeries(params: SearchSeriesParams): Promise<SeriesListResponse> {
    const { keyword, page = 1, limit = 12 } = params;
    const skip = (page - 1) * limit;

    if (!keyword || keyword.trim() === '') {
      throw new MidwayHttpError('搜索关键词不能为空', 400);
    }

    // 执行模糊搜索
    const [series, total] = await this.seriesRepository.findAndCount({
      where: {
        name: Like(`%${keyword}%`),
        isActive: true
      },
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return {
      series,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  async getPopularSeries(limit: number = 10): Promise<BlindBoxSeries[]> {
    const series = await this.seriesRepository.find({
      where: { isActive: true },
      order: { popularity: 'DESC', soldCount: 'DESC' },
      take: limit
    });

    return series;
  }

  async createSeries(seriesData: any): Promise<BlindBoxSeries> {
    // 检查系列名称是否已存在
    const existingSeries = await this.seriesRepository.findOne({
      where: { name: seriesData.name }
    });

    if (existingSeries) {
      throw new MidwayHttpError('系列名称已存在', 400);
    }

    // 创建系列
    const series = this.seriesRepository.create({
      name: seriesData.name,
      description: seriesData.description,
      category: seriesData.category,
      coverImage: seriesData.coverImage,
      price: seriesData.price,
      isActive: seriesData.isActive,
      popularity: seriesData.popularity || 0,
      totalStock: 0,
      soldCount: 0
    });

    const savedSeries = await this.seriesRepository.save(series);

    // 创建系列中的物品
    if (seriesData.items && seriesData.items.length > 0) {
      for (const itemData of seriesData.items) {
        const item = this.itemRepository.create({
          name: itemData.name,
          description: itemData.description,
          image: itemData.image,
          rarity: itemData.rarity,
          dropRate: itemData.probability,
          seriesId: savedSeries.id,
          totalCount: 0,
          obtainedCount: 0,
          isActive: true
        });
        await this.itemRepository.save(item);
      }
    }

    return savedSeries;
  }
}
