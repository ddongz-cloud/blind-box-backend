import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { BlindBoxItem } from './blind-box-item.entity';

@Entity('player_shows')
@Index(['userId'])
@Index(['itemId'])
@Index(['isPublic'])
@Index(['createdAt'])
@Index(['likesCount'])
export class PlayerShow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  itemId!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ type: 'text', nullable: true })
  images!: string;

  @Column({ type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ type: 'int', default: 0 })
  likesCount!: number;

  @Column({ type: 'int', default: 0 })
  viewsCount!: number;

  @Column({ type: 'int', default: 0 })
  commentsCount!: number;

  @Column({ type: 'boolean', default: false })
  isRecommended!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  recommendedAt!: Date;

  // 关系
  @ManyToOne(() => User, user => user.playerShows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => BlindBoxItem, item => item.playerShows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: BlindBoxItem;
}
