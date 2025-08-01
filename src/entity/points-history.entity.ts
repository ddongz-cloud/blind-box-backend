import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum PointsTransactionType {
  EARN = 'earn',
  SPEND = 'spend'
}

@Entity('points_history')
@Index(['userId'])
@Index(['type'])
@Index(['createdAt'])
export class PointsHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  type!: PointsTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter!: number;

  @Column({ type: 'varchar', length: 200 })
  description!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relatedOrderId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // 关系
  @ManyToOne(() => User, user => user.pointsHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
