# 盲盒抽盒机后端项目

## 项目概述

盲盒抽盒机是一个基于现代Web技术栈构建的在线盲盒抽取平台。用户可以注册账户、浏览盲盒系列、购买并抽取盲盒、管理个人收藏，以及在玩家秀模块中展示和分享自己的收藏品。

### 核心功能
- 🔐 用户认证与授权系统
- 📦 盲盒系列管理与浏览
- 🎲 智能抽取算法与概率控制
- 📋 订单管理与状态跟踪
- 🎒 用户库存管理
- 🌟 玩家秀社交功能
- 👍 点赞与互动系统

## 技术栈

### 后端框架
- **MidwayJS 3.x** - 企业级Node.js框架
- **Koa.js** - 轻量级Web框架
- **TypeScript** - 类型安全的JavaScript超集

### 数据库
- **TypeORM** - 现代化ORM框架
- **SQLite** - 轻量级关系型数据库

### 认证与安全
- **JWT (JSON Web Tokens)** - 无状态身份验证
- **bcryptjs** - 密码加密
- **class-validator** - 数据验证

### 开发工具
- **nodemon** - 开发环境热重载
- **ts-node** - TypeScript直接执行
- **cross-env** - 跨平台环境变量

## 项目结构

```
blind-box-backend/
├── src/                          # 源代码目录
│   ├── controller/               # 控制器层
│   │   ├── auth.controller.ts    # 用户认证控制器
│   │   ├── user.controller.ts    # 用户管理控制器
│   │   ├── blindbox.controller.ts # 盲盒系列控制器
│   │   ├── order.controller.ts   # 订单管理控制器
│   │   ├── inventory.controller.ts # 库存管理控制器
│   │   └── player-show.controller.ts # 玩家秀控制器
│   ├── service/                  # 服务层
│   │   ├── user.service.ts       # 用户服务
│   │   ├── blindbox.service.ts   # 盲盒服务
│   │   ├── order.service.ts      # 订单服务
│   │   ├── inventory.service.ts  # 库存服务
│   │   └── player-show.service.ts # 玩家秀服务
│   ├── entity/                   # 数据库实体
│   │   ├── user.entity.ts        # 用户实体
│   │   ├── blind-box-series.entity.ts # 盲盒系列实体
│   │   ├── blind-box-item.entity.ts # 盲盒物品实体
│   │   ├── user-inventory.entity.ts # 用户库存实体
│   │   ├── order.entity.ts       # 订单实体
│   │   ├── player-show.entity.ts # 玩家秀实体
│   │   └── player-show-like.entity.ts # 点赞实体
│   ├── dto/                      # 数据传输对象
│   │   ├── user.dto.ts           # 用户DTO
│   │   ├── order.dto.ts          # 订单DTO
│   │   ├── inventory.dto.ts      # 库存DTO
│   │   └── player-show.dto.ts    # 玩家秀DTO
│   ├── config/                   # 配置文件
│   │   └── config.default.ts     # 默认配置
│   ├── middleware/               # 中间件
│   ├── bootstrap.ts              # 应用启动文件
│   └── configuration.ts          # 配置入口
├── docs/                         # 文档目录
│   ├── API_DOCUMENTATION.md      # API接口文档
│   └── database_schema.ts        # 数据库设计文档
├── package.json                  # 项目依赖配置
├── tsconfig.json                 # TypeScript配置
├── webapp.sqlite                 # SQLite数据库文件
└── README.md                     # 项目说明文档
```

## 数据库设计

### 实体关系图

```
User (用户)
├── OneToMany → UserInventory (用户库存)
├── OneToMany → Order (订单)
├── OneToMany → PlayerShow (玩家秀)
└── OneToMany → PlayerShowLike (点赞记录)

BlindBoxSeries (盲盒系列)
├── OneToMany → BlindBoxItem (盲盒物品)
└── OneToMany → Order (订单)

BlindBoxItem (盲盒物品)
├── ManyToOne → BlindBoxSeries (盲盒系列)
├── OneToMany → UserInventory (用户库存)
└── OneToMany → PlayerShow (玩家秀)

UserInventory (用户库存)
├── ManyToOne → User (用户)
└── ManyToOne → BlindBoxItem (盲盒物品)

Order (订单)
├── ManyToOne → User (用户)
└── ManyToOne → BlindBoxSeries (盲盒系列)

PlayerShow (玩家秀)
├── ManyToOne → User (用户)
├── ManyToOne → BlindBoxItem (盲盒物品)
└── OneToMany → PlayerShowLike (点赞记录)

PlayerShowLike (点赞记录)
├── ManyToOne → User (用户)
└── ManyToOne → PlayerShow (玩家秀)
```

### 核心实体说明

#### User (用户表)
- 存储用户基本信息、积分、等级等
- 支持用户名和邮箱唯一性约束
- 包含密码哈希和最后登录时间

#### BlindBoxSeries (盲盒系列表)
- 管理盲盒系列信息、价格、库存
- 支持分类和热度排序
- 包含上架状态和发布时间

#### BlindBoxItem (盲盒物品表)
- 存储具体物品信息和稀有度
- 配置抽取概率和获得次数统计
- 支持物品激活状态管理

#### UserInventory (用户库存表)
- 记录用户拥有的物品和数量
- 支持收藏和展示状态设置
- 包含获得方式和时间记录

#### Order (订单表)
- 管理订单状态和支付信息
- 记录抽取结果和完成时间
- 支持订单取消和状态跟踪

#### PlayerShow (玩家秀表)
- 用户展示收藏的社交功能
- 包含标题、内容和图片信息
- 支持公开状态和推荐机制

#### PlayerShowLike (点赞表)
- 记录用户对玩家秀的点赞
- 使用联合主键防止重复点赞
- 支持点赞数量统计

## 已实现的核心模块

### 1. 用户认证模块 (Auth Module)
**路径**: `/api/auth`

- **用户注册** - `POST /register`
- **用户登录** - `POST /login`
- **用户登出** - `POST /logout`
- **Token刷新** - `POST /refresh`
- **健康检查** - `GET /health`

**特性**:
- JWT无状态认证
- bcrypt密码加密
- 用户名/邮箱唯一性验证
- Token自动刷新机制

### 2. 用户管理模块 (User Module)
**路径**: `/api/users`

- **获取个人信息** - `GET /profile`
- **更新个人信息** - `PUT /profile`
- **获取积分历史** - `GET /points`

**特性**:
- 个人资料管理
- 积分系统
- 用户等级计算
- 头像和昵称设置

### 3. 盲盒系列管理模块 (BlindBox Module)
**路径**: `/api/blindbox`

- **获取系列列表** - `GET /series`
- **获取系列详情** - `GET /series/:id`
- **搜索系列** - `GET /search`
- **获取热门系列** - `GET /popular`

**特性**:
- 分页和分类筛选
- 关键词搜索
- 热度排序
- 系列详情展示

### 4. 订单管理模块 (Order Module)
**路径**: `/api/orders`

- **创建订单** - `POST /`
- **执行抽取** - `POST /:orderId/draw`
- **获取订单列表** - `GET /`
- **获取订单详情** - `GET /:orderId`
- **取消订单** - `PUT /:orderId/cancel`

**特性**:
- 智能抽取算法
- 加权随机概率
- 订单状态管理
- 抽取结果记录

### 5. 用户库存模块 (Inventory Module)
**路径**: `/api/inventory`

- **获取库存列表** - `GET /`
- **设置收藏状态** - `PUT /:inventoryId/favorite`
- **设置展示状态** - `PUT /:inventoryId/display`

**特性**:
- 分页和筛选
- 收藏管理
- 展示设置
- 获得方式记录

### 6. 玩家秀模块 (PlayerShow Module)
**路径**: `/api/player-shows`

- **发布玩家秀** - `POST /`
- **获取玩家秀列表** - `GET /`
- **获取玩家秀详情** - `GET /:showId`
- **点赞/取消点赞** - `POST /:showId/like`
- **删除玩家秀** - `DELETE /:showId`

**特性**:
- 社交分享功能
- 点赞互动系统
- 浏览次数统计
- 内容管理

## 环境配置

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 环境变量配置
创建 `.env` 文件：

```env
# 应用配置
APP_KEYS=your-app-secret-key
NODE_ENV=development

# JWT配置
JWT_SECRET=your-jwt-secret-key-very-secure-random-string

# 数据库配置
DB_TYPE=sqlite
DB_DATABASE=./webapp.sqlite

# 服务器配置
PORT=7001
```

### 安装依赖

```bash
# 安装项目依赖
npm install

# 安装开发依赖
npm install --save-dev
```

## 启动说明

### 开发环境启动

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 服务器将在 http://localhost:7001 启动
```

### 生产环境启动

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 其他命令

```bash
# 代码检查
npm run lint

# 运行测试
npm test

# 清理构建文件
npm run clean
```

## API接口文档

### 认证相关接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "user123",
    "email": "user@example.com"
  },
  "message": "注册成功"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "uuid",
      "username": "user123"
    }
  },
  "message": "登录成功"
}
```

### 盲盒相关接口

#### 获取系列列表
```http
GET /api/blindbox/series?page=1&limit=12&category=anime
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "series": [
      {
        "id": "uuid",
        "name": "动漫系列1",
        "price": 29.99,
        "coverImage": "image_url",
        "category": "anime"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 100
    }
  }
}
```

#### 获取系列详情
```http
GET /api/blindbox/series/{seriesId}
```

### 订单相关接口

#### 创建订单
```http
POST /api/orders
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "seriesId": "uuid",
  "quantity": 1,
  "paymentMethod": "points"
}
```

#### 执行抽取
```http
POST /api/orders/{orderId}/draw
Authorization: Bearer {jwt_token}
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "角色A",
      "rarity": "rare",
      "image": "image_url",
      "dropRate": 5.0
    }
  ],
  "message": "抽取成功"
}
```

### 库存相关接口

#### 获取库存列表
```http
GET /api/inventory?page=1&limit=20&rarity=rare
Authorization: Bearer {jwt_token}
```

#### 设置收藏状态
```http
PUT /api/inventory/{inventoryId}/favorite
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "isFavorite": true
}
```

### 玩家秀相关接口

#### 发布玩家秀
```http
POST /api/player-shows
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "inventoryId": "uuid",
  "title": "我的收藏",
  "content": "分享内容"
}
```

#### 点赞玩家秀
```http
POST /api/player-shows/{showId}/like
Authorization: Bearer {jwt_token}
```

## 测试说明

### API测试示例

使用PowerShell进行API测试：

```powershell
# 1. 用户注册
$registerData = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:7001/api/auth/register" -Method POST -ContentType "application/json" -Body $registerData

# 2. 用户登录
$loginData = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:7001/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
$token = $loginResponse.data.token

# 3. 获取个人信息
$headers = @{ "Authorization" = "Bearer $token" }
$profile = Invoke-RestMethod -Uri "http://localhost:7001/api/users/profile" -Method GET -Headers $headers

# 4. 获取盲盒系列列表
$series = Invoke-RestMethod -Uri "http://localhost:7001/api/blindbox/series" -Method GET

# 5. 创建订单
$orderData = @{
    seriesId = "series-uuid"
    quantity = 1
    paymentMethod = "points"
} | ConvertTo-Json

$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
$order = Invoke-RestMethod -Uri "http://localhost:7001/api/orders" -Method POST -Headers $headers -Body $orderData

# 6. 执行抽取
$drawResult = Invoke-RestMethod -Uri "http://localhost:7001/api/orders/$($order.data.orderId)/draw" -Method POST -Headers $headers
```

### 测试数据准备

项目启动时会自动创建数据库表结构。如需测试数据，可以：

1. 注册测试用户
2. 通过数据库管理工具添加盲盒系列和物品数据
3. 或使用API接口创建测试数据

## 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用Prettier格式化代码
- 采用驼峰命名法

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

### 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支，用于功能集成
- feature/*: 功能分支
- hotfix/*: 热修复分支

## 部署说明

### Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 7001

CMD ["npm", "start"]
```

### 环境变量配置

生产环境需要配置以下环境变量：
- `NODE_ENV=production`
- `JWT_SECRET`: 强随机字符串
- `APP_KEYS`: 应用密钥
- `PORT`: 服务端口（默认7001）

## 项目完整性检查结果

### ✅ 已完成的功能模块
1. **用户认证模块** - 完整实现注册、登录、登出、Token刷新
2. **用户管理模块** - 个人信息管理、积分系统
3. **盲盒系列模块** - 系列浏览、搜索、详情查看
4. **订单管理模块** - 订单创建、抽取执行、状态管理
5. **用户库存模块** - 库存查看、收藏管理、展示设置
6. **玩家秀模块** - 社交分享、点赞互动、内容管理

### ✅ 数据库设计
- 7个核心实体完整定义
- 实体关系正确配置
- 索引和约束合理设置
- 支持数据完整性和性能优化

### ✅ API接口
- 25+ RESTful API接口
- 统一的响应格式
- 完整的错误处理
- JWT认证和权限控制

### ✅ 技术架构
- MidwayJS企业级框架
- TypeORM数据库ORM
- JWT无状态认证
- 分层架构设计

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 联系方式

- 项目地址: https://github.com/ddongz-cloud/blind-box-backend

---

**注意**: 此文档由AI辅助生成