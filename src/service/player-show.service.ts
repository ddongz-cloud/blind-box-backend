import { Provide } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerShow } from '../entity/player-show.entity';
import { UserInventory } from '../entity/user-inventory.entity';
import { PlayerShowLike } from '../entity/player-show-like.entity';
import { CreatePlayerShowDto, GetPlayerShowListDto } from '../dto/player-show.dto';

export interface PlayerShowListResponse {
  shows: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlayerShowDetailResponse {
  id: string;
  title: string;
  content: string;
  images: string;
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: any;
  item: any;
  isLiked?: boolean;
}

export interface LikeToggleResponse {
  likesCount: number;
  isLiked: boolean;
}

@Provide()
export class PlayerShowService {
  @InjectEntityModel(PlayerShow)
  playerShowRepository!: Repository<PlayerShow>;

  @InjectEntityModel(UserInventory)
  inventoryRepository!: Repository<UserInventory>;

  @InjectEntityModel(PlayerShowLike)
  likeRepository!: Repository<PlayerShowLike>;

  async createPlayerShow(userId: string, dto: CreatePlayerShowDto): Promise<any> {
    console.log('PlayerShowService.createPlayerShow called with:', { userId, dto });

    // 验证库存项是否属于当前用户
    const inventory = await this.inventoryRepository.findOne({
      where: { id: dto.inventoryId, userId },
      relations: ['item']
    });

    if (!inventory) {
      throw new MidwayHttpError('库存项不存在或不属于您', 403);
    }

    // 创建玩家秀
    const playerShow = this.playerShowRepository.create({
      title: dto.title,
      content: dto.content,
      userId,
      itemId: inventory.itemId,
      isPublic: true,
      likesCount: 0,
      viewsCount: 0,
      commentsCount: 0,
      isRecommended: false
    });

    const savedShow = await this.playerShowRepository.save(playerShow);

    console.log('PlayerShow created successfully:', savedShow.id);

    return {
      id: savedShow.id,
      title: savedShow.title,
      content: savedShow.content,
      createdAt: savedShow.createdAt
    };
  }

  async getPlayerShowList(query: GetPlayerShowListDto): Promise<PlayerShowListResponse> {
    console.log('PlayerShowService.getPlayerShowList called with:', query);

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    // 构建查询
    const queryBuilder = this.playerShowRepository.createQueryBuilder('playerShow')
      .leftJoinAndSelect('playerShow.user', 'user')
      .leftJoinAndSelect('playerShow.item', 'item')
      .leftJoinAndSelect('item.series', 'series')
      .where('playerShow.isPublic = :isPublic', { isPublic: true })
      .select([
        'playerShow.id',
        'playerShow.title', 
        'playerShow.content',
        'playerShow.images',
        'playerShow.likesCount',
        'playerShow.viewsCount',
        'playerShow.commentsCount',
        'playerShow.isRecommended',
        'playerShow.createdAt',
        'user.id',
        'user.username',
        'user.nickname',
        'user.avatar',
        'item.id',
        'item.name',
        'item.image',
        'item.rarity',
        'series.id',
        'series.name'
      ]);

    // 排序
    if (query.sort === 'latest') {
      queryBuilder.orderBy('playerShow.createdAt', 'DESC');
    } else if (query.sort === 'popular') {
      queryBuilder.orderBy('playerShow.likesCount', 'DESC');
    } else {
      queryBuilder.orderBy('playerShow.createdAt', 'DESC');
    }

    // 分页
    queryBuilder.skip(skip).take(limit);

    const [shows, total] = await queryBuilder.getManyAndCount();

    console.log(`Found ${shows.length} player shows`);

    const totalPages = Math.ceil(total / limit);

    return {
      shows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async getPlayerShowDetail(showId: string, userId?: string): Promise<PlayerShowDetailResponse> {
    console.log('PlayerShowService.getPlayerShowDetail called with:', { showId, userId });

    // 查找玩家秀详情
    const playerShow = await this.playerShowRepository.findOne({
      where: { id: showId, isPublic: true },
      relations: ['user', 'item', 'item.series'],
      select: {
        id: true,
        title: true,
        content: true,
        images: true,
        isPublic: true,
        likesCount: true,
        viewsCount: true,
        commentsCount: true,
        isRecommended: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          nickname: true,
          avatar: true
        },
        item: {
          id: true,
          name: true,
          description: true,
          image: true,
          rarity: true,
          series: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!playerShow) {
      throw new MidwayHttpError('玩家秀不存在', 404);
    }

    // 增加浏览次数
    await this.playerShowRepository.update(showId, {
      viewsCount: playerShow.viewsCount + 1
    });

    // 检查当前用户是否已点赞
    let isLiked = false;
    if (userId) {
      const like = await this.likeRepository.findOne({
        where: { userId, playerShowId: showId }
      });
      isLiked = !!like;
    }

    console.log('PlayerShow detail found:', playerShow.title);

    return {
      ...playerShow,
      isLiked
    };
  }

  async toggleLike(userId: string, showId: string): Promise<LikeToggleResponse> {
    console.log('PlayerShowService.toggleLike called with:', { userId, showId });

    // 验证玩家秀是否存在
    const playerShow = await this.playerShowRepository.findOne({
      where: { id: showId, isPublic: true }
    });

    if (!playerShow) {
      throw new MidwayHttpError('玩家秀不存在', 404);
    }

    // 检查是否已点赞
    const existingLike = await this.likeRepository.findOne({
      where: { userId, playerShowId: showId }
    });

    let isLiked: boolean;
    let likesCount: number;

    if (existingLike) {
      // 取消点赞
      await this.likeRepository.remove(existingLike);
      likesCount = Math.max(0, playerShow.likesCount - 1);
      isLiked = false;
      console.log('Like removed');
    } else {
      // 添加点赞
      const newLike = this.likeRepository.create({
        userId,
        playerShowId: showId
      });
      await this.likeRepository.save(newLike);
      likesCount = playerShow.likesCount + 1;
      isLiked = true;
      console.log('Like added');
    }

    // 更新玩家秀的点赞数
    await this.playerShowRepository.update(showId, { likesCount });

    return {
      likesCount,
      isLiked
    };
  }

  async deletePlayerShow(userId: string, showId: string): Promise<{ message: string }> {
    console.log('PlayerShowService.deletePlayerShow called with:', { userId, showId });

    // 查找玩家秀
    const playerShow = await this.playerShowRepository.findOne({
      where: { id: showId }
    });

    if (!playerShow) {
      throw new MidwayHttpError('玩家秀不存在', 404);
    }

    // 权限检查
    if (playerShow.userId !== userId) {
      throw new MidwayHttpError('无权删除他人的玩家秀', 403);
    }

    // 删除相关的点赞记录
    await this.likeRepository.delete({ playerShowId: showId });

    // 删除玩家秀
    await this.playerShowRepository.remove(playerShow);

    console.log(`PlayerShow ${showId} deleted successfully`);

    return {
      message: '删除成功'
    };
  }
}
