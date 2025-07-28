import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { BlindBoxSeries } from './blind-box-series.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  POINTS = 'points',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CREDIT_CARD = 'credit_card'
}

@Entity('orders')
@Index(['userId'])
@Index(['seriesId'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  orderNumber!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  seriesId!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status!: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true
  })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentTransactionId!: string;

  @Column({ type: 'text', nullable: true })
  resultItems!: string;

  @Column({ type: 'text', nullable: true })
  remarks!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  paidAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt!: Date;

  // 关系
  @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => BlindBoxSeries, series => series.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seriesId' })
  series!: BlindBoxSeries;
}
