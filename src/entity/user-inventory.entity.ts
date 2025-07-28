import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from './user.entity';
import { BlindBoxItem } from './blind-box-item.entity';

@Entity('user_inventory')
@Index(['userId'])
@Index(['itemId'])
@Index(['obtainedAt'])
@Unique(['userId', 'itemId'])
export class UserInventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  itemId!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'boolean', default: false })
  isDisplayed!: boolean;

  @Column({ type: 'boolean', default: false })
  isFavorite!: boolean;

  @CreateDateColumn()
  obtainedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  obtainMethod!: string;

  // 关系
  @ManyToOne(() => User, user => user.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => BlindBoxItem, item => item.userInventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: BlindBoxItem;
}
