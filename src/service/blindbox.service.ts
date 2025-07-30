import { Provide, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BlindBoxSeries } from '../entity/blind-box-series.entity';

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
}
