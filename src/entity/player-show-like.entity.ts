import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { PlayerShow } from './player-show.entity';

@Entity('player_show_likes')
export class PlayerShowLike {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  playerShowId!: string;

  @ManyToOne(() => User, user => user.playerShowLikes)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => PlayerShow, playerShow => playerShow.likes)
  @JoinColumn({ name: 'playerShowId' })
  playerShow!: PlayerShow;

  @CreateDateColumn()
  createdAt!: Date;
}
