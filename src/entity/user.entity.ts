import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { UserInventory } from './user-inventory.entity';
import { Order } from './order.entity';
import { PlayerShow } from './player-show.entity';
import { PlayerShowLike } from './player-show-like.entity';

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar!: string;

  @Column({ type: 'int', default: 0 })
  points!: number;

  @Column({ type: 'int', default: 1 })
  level!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt!: Date;

  // 关系
  @OneToMany(() => UserInventory, inventory => inventory.user)
  inventory!: UserInventory[];

  @OneToMany(() => Order, order => order.user)
  orders!: Order[];

  @OneToMany(() => PlayerShow, playerShow => playerShow.user)
  playerShows!: PlayerShow[];

  @OneToMany(() => PlayerShowLike, like => like.user)
  playerShowLikes!: PlayerShowLike[];
}
