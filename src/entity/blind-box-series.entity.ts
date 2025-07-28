import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { BlindBoxItem } from './blind-box-item.entity';
import { Order } from './order.entity';

@Entity('blind_box_series')
@Index(['name'])
@Index(['category'])
@Index(['isActive'])
export class BlindBoxSeries {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  totalStock!: number;

  @Column({ type: 'int', default: 0 })
  soldCount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  popularity!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  launchDate!: Date;

  // 关系
  @OneToMany(() => BlindBoxItem, item => item.series)
  items!: BlindBoxItem[];

  @OneToMany(() => Order, order => order.series)
  orders!: Order[];
}
