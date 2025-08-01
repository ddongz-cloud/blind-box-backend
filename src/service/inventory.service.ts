import { Provide } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInventory } from '../entity/user-inventory.entity';
import { UpdateFavoriteDto, UpdateDisplayDto, GetInventoryQueryDto } from '../dto/inventory.dto';

export interface InventoryListResponse {
  items: UserInventory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateStatusResponse {
  inventoryId: string;
  isFavorite?: boolean;
  isDisplayed?: boolean;
}

@Provide()
export class InventoryService {
  @InjectEntityModel(UserInventory)
  inventoryRepository!: Repository<UserInventory>;

  async getInventoryList(userId: string, query: GetInventoryQueryDto): Promise<InventoryListResponse> {
    console.log('InventoryService.getInventoryList called with:', { userId, query });

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const whereCondition: any = { userId };
    
    // 如果指定了稀有度，添加到查询条件中
    if (query.rarity) {
      whereCondition.item = { rarity: query.rarity };
    }

    // 执行分页查询，预加载物品信息和系列信息
    const [items, total] = await this.inventoryRepository.findAndCount({
      where: whereCondition,
      relations: ['item', 'item.series'],
      skip,
      take: limit,
      order: {
        obtainedAt: 'DESC' // 按获得时间倒序排列
      }
    });

    console.log(`Found ${items.length} inventory items for user ${userId}`);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async updateFavoriteStatus(userId: string, inventoryId: string, dto: UpdateFavoriteDto): Promise<UpdateStatusResponse> {
    console.log('InventoryService.updateFavoriteStatus called with:', { userId, inventoryId, dto });

    // 查找库存项
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { id: inventoryId }
    });

    if (!inventoryItem) {
      throw new MidwayHttpError('库存项不存在', 404);
    }

    // 权限检查
    if (inventoryItem.userId !== userId) {
      throw new MidwayHttpError('无权操作他人库存', 403);
    }

    // 更新收藏状态
    inventoryItem.isFavorite = dto.isFavorite;
    await this.inventoryRepository.save(inventoryItem);

    console.log(`Updated favorite status for inventory ${inventoryId} to ${dto.isFavorite}`);

    return {
      inventoryId,
      isFavorite: inventoryItem.isFavorite
    };
  }

  async updateDisplayStatus(userId: string, inventoryId: string, dto: UpdateDisplayDto): Promise<UpdateStatusResponse> {
    console.log('InventoryService.updateDisplayStatus called with:', { userId, inventoryId, dto });

    // 查找库存项
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { id: inventoryId }
    });

    if (!inventoryItem) {
      throw new MidwayHttpError('库存项不存在', 404);
    }

    // 权限检查
    if (inventoryItem.userId !== userId) {
      throw new MidwayHttpError('无权操作他人库存', 403);
    }

    // 更新展示状态
    inventoryItem.isDisplayed = dto.isDisplayed;
    await this.inventoryRepository.save(inventoryItem);

    console.log(`Updated display status for inventory ${inventoryId} to ${dto.isDisplayed}`);

    return {
      inventoryId,
      isDisplayed: inventoryItem.isDisplayed
    };
  }
}
