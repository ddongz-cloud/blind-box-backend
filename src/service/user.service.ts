import { Provide, Inject } from '@midwayjs/core';
import { MidwayHttpError } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@midwayjs/jwt';
import { User } from '../entity/user.entity';

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface RefreshTokenResponse {
  token: string;
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

  @Inject()
  jwtService!: JwtService;

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

  async login(loginData: LoginUserDto): Promise<LoginResponse> {
    const { username, password } = loginData;

    // 根据用户名查找用户
    const user = await this.userRepository.findOne({
      where: { username }
    });

    if (!user) {
      throw new MidwayHttpError('用户名或密码错误', 401);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new MidwayHttpError('用户名或密码错误', 401);
    }

    // 生成JWT token
    const payload = {
      id: user.id,
      username: user.username
    };
    const token = await this.jwtService.sign(payload);

    // 更新最后登录时间
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date()
    });

    // 返回token和用户信息（不包含密码）
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        createdAt: user.createdAt
      }
    };
  }

  async refreshToken(userPayload: { id: string; username: string }): Promise<RefreshTokenResponse> {
    // 生成新的JWT token
    const payload = {
      id: userPayload.id,
      username: userPayload.username
    };
    const token = await this.jwtService.sign(payload);

    return {
      token
    };
  }
}
