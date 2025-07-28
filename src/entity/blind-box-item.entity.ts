import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BlindBoxSeries } from './blind-box-series.entity';
import { UserInventory } from './user-inventory.entity';
import { PlayerShow } from './player-show.entity';

export enum RarityLevel {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

@Entity('blind_box_items')
@Index(['seriesId'])
@Index(['rarity'])
@Index(['isActive'])
export class BlindBoxItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string;

  @Column({
    type: 'enum',
    enum: RarityLevel,
    default: RarityLevel.COMMON
  })
  rarity!: RarityLevel;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  dropRate!: number;

  @Column({ type: 'int', default: 0 })
  totalCount!: number;

  @Column({ type: 'int', default: 0 })
  obtainedCount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'uuid' })
  seriesId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 关系
  @ManyToOne(() => BlindBoxSeries, series => series.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seriesId' })
  series!: BlindBoxSeries;

  @OneToMany(() => UserInventory, inventory => inventory.item)
  userInventories!: UserInventory[];

  @OneToMany(() => PlayerShow, playerShow => playerShow.item)
  playerShows!: PlayerShow[];
}
