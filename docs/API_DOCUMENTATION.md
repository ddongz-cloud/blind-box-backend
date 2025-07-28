# 盲盒抽盒机 API 接口文档

## 1. 用户认证模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 用户认证 | 用户注册 | POST | `/api/auth/register` | `Content-Type: application/json` | `{"username": "user123", "email": "user@example.com", "password": "password123"}` | `201: {"success": true, "data": {"id": "uuid", "username": "user123", "email": "user@example.com"}, "message": "注册成功"}` | `400: {"success": false, "message": "用户名已存在"}` |
| 用户认证 | 用户登录 | POST | `/api/auth/login` | `Content-Type: application/json` | `{"username": "user123", "password": "password123"}` | `200: {"success": true, "data": {"token": "jwt_token", "user": {"id": "uuid", "username": "user123"}}, "message": "登录成功"}` | `401: {"success": false, "message": "用户名或密码错误"}` |
| 用户认证 | 用户登出 | POST | `/api/auth/logout` | `Authorization: Bearer jwt_token` | `{}` | `200: {"success": true, "message": "登出成功"}` | `401: {"success": false, "message": "未授权"}` |
| 用户认证 | 刷新Token | POST | `/api/auth/refresh` | `Authorization: Bearer jwt_token` | `{}` | `200: {"success": true, "data": {"token": "new_jwt_token"}, "message": "Token刷新成功"}` | `401: {"success": false, "message": "Token已过期"}` |

## 2. 用户管理模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 用户管理 | 获取个人信息 | GET | `/api/users/profile` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"id": "uuid", "username": "user123", "email": "user@example.com", "points": 1000, "level": 5}}` | `401: {"success": false, "message": "未授权"}` |
| 用户管理 | 更新个人信息 | PUT | `/api/users/profile` | `Authorization: Bearer jwt_token, Content-Type: application/json` | `{"nickname": "新昵称", "avatar": "avatar_url"}` | `200: {"success": true, "data": {"id": "uuid", "nickname": "新昵称"}, "message": "更新成功"}` | `400: {"success": false, "message": "昵称格式不正确"}` |
| 用户管理 | 获取积分记录 | GET | `/api/users/points?page=1&limit=10` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"points": 1000, "records": [], "pagination": {"page": 1, "limit": 10, "total": 50}}}` | `401: {"success": false, "message": "未授权"}` |

## 3. 盲盒系列管理模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 盲盒系列 | 获取系列列表 | GET | `/api/series?page=1&limit=12&category=anime` | 无 | 无 | `200: {"success": true, "data": {"series": [{"id": "uuid", "name": "动漫系列1", "price": 29.99, "coverImage": "url"}], "pagination": {"page": 1, "limit": 12, "total": 100}}}` | `400: {"success": false, "message": "分页参数错误"}` |
| 盲盒系列 | 获取系列详情 | GET | `/api/series/{id}` | 无 | 无 | `200: {"success": true, "data": {"id": "uuid", "name": "动漫系列1", "description": "描述", "items": [{"id": "uuid", "name": "角色A", "rarity": "rare"}]}}` | `404: {"success": false, "message": "系列不存在"}` |
| 盲盒系列 | 搜索系列 | GET | `/api/series/search?keyword=动漫&category=anime&page=1&limit=12` | 无 | 无 | `200: {"success": true, "data": {"series": [], "pagination": {"page": 1, "limit": 12, "total": 20}}}` | `400: {"success": false, "message": "搜索关键词不能为空"}` |
| 盲盒系列 | 获取热门系列 | GET | `/api/series/popular?limit=10` | 无 | 无 | `200: {"success": true, "data": {"series": [{"id": "uuid", "name": "热门系列", "popularity": 9999}]}}` | `500: {"success": false, "message": "服务器内部错误"}` |

## 4. 盲盒抽取模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 盲盒抽取 | 创建订单 | POST | `/api/orders` | `Authorization: Bearer jwt_token, Content-Type: application/json` | `{"seriesId": "uuid", "quantity": 1, "paymentMethod": "points"}` | `201: {"success": true, "data": {"orderId": "uuid", "orderNumber": "ORD123456", "totalAmount": 29.99}, "message": "订单创建成功"}` | `400: {"success": false, "message": "库存不足"}` |
| 盲盒抽取 | 执行抽取 | POST | `/api/orders/{orderId}/draw` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"items": [{"id": "uuid", "name": "稀有角色", "rarity": "epic", "image": "url"}]}, "message": "抽取成功"}` | `404: {"success": false, "message": "订单不存在"}` |

## 5. 用户库存模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 用户库存 | 获取库存列表 | GET | `/api/inventory?page=1&limit=20&rarity=rare` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"items": [{"id": "uuid", "item": {"name": "角色A", "rarity": "rare"}, "quantity": 2, "isFavorite": true}], "pagination": {"page": 1, "limit": 20, "total": 50}}}` | `401: {"success": false, "message": "未授权"}` |
| 用户库存 | 设置收藏状态 | PUT | `/api/inventory/{inventoryId}/favorite` | `Authorization: Bearer jwt_token, Content-Type: application/json` | `{"isFavorite": true}` | `200: {"success": true, "message": "收藏状态更新成功"}` | `404: {"success": false, "message": "库存项不存在"}` |
| 用户库存 | 设置展示状态 | PUT | `/api/inventory/{inventoryId}/display` | `Authorization: Bearer jwt_token, Content-Type: application/json` | `{"isDisplayed": true}` | `200: {"success": true, "message": "展示状态更新成功"}` | `404: {"success": false, "message": "库存项不存在"}` |

## 6. 订单管理模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 订单管理 | 获取订单列表 | GET | `/api/orders?page=1&limit=10&status=completed` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"orders": [{"id": "uuid", "orderNumber": "ORD123456", "status": "completed", "totalAmount": 29.99, "createdAt": "2024-01-01T00:00:00Z"}], "pagination": {"page": 1, "limit": 10, "total": 25}}}` | `401: {"success": false, "message": "未授权"}` |
| 订单管理 | 获取订单详情 | GET | `/api/orders/{orderId}` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"id": "uuid", "orderNumber": "ORD123456", "series": {"name": "动漫系列1"}, "status": "completed", "resultItems": [{"name": "角色A", "rarity": "rare"}]}}` | `404: {"success": false, "message": "订单不存在"}` |
| 订单管理 | 取消订单 | PUT | `/api/orders/{orderId}/cancel` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "message": "订单取消成功"}` | `400: {"success": false, "message": "订单状态不允许取消"}` |

## 7. 玩家秀模块

| 功能模块 | 接口描述 | HTTP 方法 | URL 路径 | 请求头要求 | 请求体/参数示例 | 成功响应示例（含状态码） | 常见错误响应示例 |
|---------|---------|----------|----------|-----------|----------------|----------------------|-----------------|
| 玩家秀 | 发布玩家秀 | POST | `/api/player-shows` | `Authorization: Bearer jwt_token, Content-Type: application/json` | `{"itemId": "uuid", "title": "我的收藏", "content": "分享内容", "images": ["url1", "url2"], "isPublic": true}` | `201: {"success": true, "data": {"id": "uuid", "title": "我的收藏"}, "message": "发布成功"}` | `400: {"success": false, "message": "物品不存在"}` |
| 玩家秀 | 获取玩家秀列表 | GET | `/api/player-shows?page=1&limit=12&sort=latest` | 无 | 无 | `200: {"success": true, "data": {"shows": [{"id": "uuid", "title": "我的收藏", "user": {"username": "user123"}, "likesCount": 10, "viewsCount": 100}], "pagination": {"page": 1, "limit": 12, "total": 200}}}` | `400: {"success": false, "message": "分页参数错误"}` |
| 玩家秀 | 获取玩家秀详情 | GET | `/api/player-shows/{showId}` | 无 | 无 | `200: {"success": true, "data": {"id": "uuid", "title": "我的收藏", "content": "分享内容", "images": ["url1"], "user": {"username": "user123"}, "item": {"name": "角色A", "rarity": "rare"}, "likesCount": 10}}` | `404: {"success": false, "message": "玩家秀不存在"}` |
| 玩家秀 | 点赞玩家秀 | POST | `/api/player-shows/{showId}/like` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"likesCount": 11}, "message": "点赞成功"}` | `400: {"success": false, "message": "已经点赞过了"}` |
| 玩家秀 | 取消点赞 | DELETE | `/api/player-shows/{showId}/like` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "data": {"likesCount": 10}, "message": "取消点赞成功"}` | `400: {"success": false, "message": "尚未点赞"}` |
| 玩家秀 | 删除玩家秀 | DELETE | `/api/player-shows/{showId}` | `Authorization: Bearer jwt_token` | 无 | `200: {"success": true, "message": "删除成功"}` | `403: {"success": false, "message": "无权限删除"}` |

## 通用错误响应

| 状态码 | 错误类型 | 响应示例 |
|-------|---------|---------|
| 400 | 请求参数错误 | `{"success": false, "message": "请求参数格式错误", "errors": ["username不能为空"]}` |
| 401 | 未授权 | `{"success": false, "message": "未授权，请先登录"}` |
| 403 | 权限不足 | `{"success": false, "message": "权限不足"}` |
| 404 | 资源不存在 | `{"success": false, "message": "请求的资源不存在"}` |
| 429 | 请求频率限制 | `{"success": false, "message": "请求过于频繁，请稍后再试"}` |
| 500 | 服务器内部错误 | `{"success": false, "message": "服务器内部错误"}` |
