import { Provide, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entity/user.entity';

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  points: number;
  level: number;
  createdAt: Date;
}

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepository!: Repository<User>;

  async register(userData: RegisterUserDto): Promise<UserResponse> {
    const { username, email, password } = userData;

    // 检查用户名或邮箱是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { username },
        { email }
      ]
    });

    if (existingUser) {
      throw new MidwayHttpError('用户名或邮箱已存在', 409);
    }

    // 对密码进行哈希处理
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建新用户
    const newUser = this.userRepository.create({
      username,
      email,
      passwordHash,
      nickname: username, // 默认昵称为用户名
      points: 0,
      level: 1,
      isActive: true
    });

    // 保存到数据库
    const savedUser = await this.userRepository.save(newUser);

    // 返回用户信息（不包含密码哈希）
    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      nickname: savedUser.nickname,
      avatar: savedUser.avatar,
      points: savedUser.points,
      level: savedUser.level,
      createdAt: savedUser.createdAt
    };
  }
}
