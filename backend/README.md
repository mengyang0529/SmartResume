# Web Resume Backend

本 `backend` 模块负责 Web Resume 应用的 API、数据库访问、Typst 简历生成与 PDF 编译协调。

## 1. 项目概览

- 框架：`Express` + `TypeScript`
- ORM：`Prisma`（PostgreSQL）
- 文档校验：`express-validator`、`zod`
- 安全与性能：`helmet`、`cors`、`compression`、`express-rate-limit`
- Typst 集成：后端调用外部 Typst 编译服务生成 PDF/预览
- 运行模式：开发使用 `tsx watch`，生产使用 `tsc` 编译后执行

## 2. 目录结构

- `src/index.ts`：Express 应用入口，注册中间件、路由、错误处理和健康检查
- `src/config/env.ts`：环境变量加载与验证
- `src/routes/`：路由模块注册
  - `auth.routes.ts`：当前版本禁用登录注册，返回 `503`
  - `resume.routes.ts`：简历 CRUD、采样数据、复制、删除
  - `template.routes.ts`：模板列表、模板详情、模板管理接口（当前为模拟数据/占位实现）
  - `pdf.routes.ts`：PDF 生成、预览、刷新预览缓存
  - `user.routes.ts`：用户相关接口（可以扩展）
- `src/services/`：业务逻辑层
  - `resume.service.ts`：简历创建、更新、查询、删除、复制、下载计数等业务逻辑
  - `typst.service.ts`：将结构化简历数据转换为 Typst 源码
- `src/middleware/`：通用中间件
  - `errorHandler.ts`：统一异常处理、Zod/Prisma 错误转换、开发环境堆栈输出
  - `rateLimiter.ts`：通用限流、PDF 上传限流、认证/API key 限流
- `prisma/schema.prisma`：数据库模型定义

## 3. 核心运行流程

1. `src/index.ts` 初始化 Express 应用
2. 加载安全中间件：`helmet`、`cors`、`compression`
3. 使用 `express.json()` 解析请求体
4. 启用日志：`morgan`
5. 启用限流：全局 `rateLimiter`，PDF 路由额外 `pdfRateLimit`
6. 注册路由模块：`/api/v1/*`
7. 未命中路由进入 `notFoundHandler`
8. 统一异常由 `errorHandler` 处理并返回标准 JSON

## 4. 重要配置与环境变量

在 `backend/.env` 或部署环境中需要设置：

- `NODE_ENV`：`development` / `production` / `test`
- `PORT`：服务监听端口，默认 `5000`
- `DATABASE_URL`：PostgreSQL 连接字符串
- `JWT_SECRET`：JWT 签名密钥（当前 auth 未启用，但仍校验存在性）
- `SESSION_SECRET`：会话加密密钥
- `CORS_ORIGIN`：允许跨域请求来源，默认 `http://localhost:3000`
- `TYPST_SERVICE_URL`：Typst 服务地址，默认 `http://localhost:5050`
- `REDIS_URL`：可选 Redis 地址，用于限流持久化
- `RATE_LIMIT_WINDOW_MS`：限流窗口，默认 `900000`（15 min）
- `RATE_LIMIT_MAX_REQUESTS`：限流请求上限，默认 `100`
- `API_KEY`：可选 API key，用于未来外部访问授权

## 5. 主要依赖

- `express`：HTTP 服务
- `@prisma/client` / `prisma`：数据库 ORM
- `zod`：环境变量规范校验
- `express-validator`：请求参数与 body 校验
- `axios`：调用外部 Typst 服务
- `helmet`：安全响应头
- `cors`：CORS 控制
- `express-rate-limit`：API 限流
- `compression`：响应压缩
- `cookie-parser`：解析 Cookie
- `morgan`：请求日志

## 6. 数据库与 Prisma

`prisma/schema.prisma` 定义了以下模型：

- `User`
- `Resume`
- `Template`
- `PdfJob`
- `Session`

当前后端核心使用 `Resume` 表存储：

- `content`：简历 JSON 数据
- `typstSource`：生成后的 Typst 文本
- `settings`：模板/配色配置
- `downloadCount`、`isPublic`、`userId` 等

### 常用 Prisma 命令

- `npm run db:generate`：生成 Prisma Client
- `npm run db:migrate`：运行迁移
- `npm run db:studio`：打开 Prisma Studio

## 7. Typst 集成

后端通过 `TypstService` 将结构化简历数据转换为 Typst 源码。关键点：

- 自动转义 Typst 字符串与内容
- 根据 `TemplateSettings` 映射颜色、纸张尺寸和头部对齐
- 支持个人信息、简介、工作经历、教育、技能、项目、语言、荣誉、证书、出版物等模块
- 生成的 Typst 由后端 `pdf.routes.ts` 调用 `TYPST_SERVICE_URL/compile`

### PDF 生成相关路由

- `GET /api/v1/pdf/refresh-all-previews`：刷新多个模板的预览缓存
- `GET /api/v1/pdf/preview-template/:templateName`：为指定模板生成/获取预览缓存
- `POST /api/v1/pdf/generate`：直接请求 Typst 编译并返回缓存 key

## 8. 路由设计

### 8.1 通用路由注册

- `GET /health`：健康检查
- `GET /api/docs`：简单 API 文档路由
- `/api/v1/auth`：认证占位接口，当前返回 `503`
- `/api/v1/resumes`：简历管理接口
- `/api/v1/templates`：模板管理接口，当前仍以 mock 和 stub 实现
- `/api/v1/pdf`：PDF / Typst 编译接口
- `/api/v1/users`：用户接口占位

### 8.2 Resume 路由亮点

- `GET /api/v1/resumes/sample`：返回演示简历数据
- `GET /api/v1/resumes`：分页查询用户简历（当前使用 mock userId）
- `POST /api/v1/resumes`：新建简历并生成 Typst
- `GET /api/v1/resumes/:id`：读取简历
- `PUT /api/v1/resumes/:id`：更新简历并按需重新生成 Typst
- `DELETE /api/v1/resumes/:id`：删除简历
- `POST /api/v1/resumes/:id/duplicate`：复制简历

## 9. 中间件与安全

### 9.1 `errorHandler`

- 捕获 `AppError`、`ValidationError`、`ZodError`、Prisma 错误
- 开发环境返回详细 `stack`
- 统一响应格式：
  - `status: error`
  - `message`
  - `errors`（可选）

### 9.2 `rateLimiter`

- 全局请求限流
- PDF 生成请求使用更高阈值但单独限流
- Auth 登录请求也预留专用限流
- 支持 Redis 存储，未配置时回退内存存储

### 9.3 `helmet` 与 `cors`

- `helmet` 已启用跨域策略与内容安全策略
- `cors` 限制来源为 `CORS_ORIGIN`

## 10. 开发与测试

### 10.1 本地开发

```bash
cd backend
npm install
npm run dev
```

### 10.2 构建发布

```bash
npm run build
npm start
```

### 10.3 类型检查与格式化

```bash
npm run type-check
npm run lint
npm run format
```

### 10.4 测试

```bash
npm run test
npm run test:coverage
```

## 11. 已知待办 / 迭代点

- `auth.routes.ts` 目前是占位实现，真正用户认证尚未启用
- `template.routes.ts` 仍为 mock 数据与模拟创建
- `resume.routes.ts` 中 `userId` 当前硬编码为 `user-id-mock`
- `user.routes.ts` 目前未实现完整用户生命周期
- 可以补充 `Jwt` 认证中间件，并将请求用户从 token 中解析到 `req.user`
- 数据库事务与 Typst 生成失败回滚逻辑可进一步强化

## 12. 细节说明

- `src/config/env.ts` 使用 `zod` 对环境变量做强类型校验，启动失败即报错退出
- `prisma/schema.prisma` 采用 `Json` 类型存储动态简历字段和模板配置
- `TypstService.generateResumeTypst()` 负责将动态数据映射为可编译 Typst 源
- `pdf.routes.ts` 里 `axios` 调用 `TYPST_SERVICE_URL/compile`，并处理缓存 key、cache hit、异常返回

## 13. 目录快速定位

- 后端主入口：`backend/src/index.ts`
- 路由注册：`backend/src/routes/index.ts`
- 业务逻辑：`backend/src/services/*.ts`
- 中间件：`backend/src/middleware/*.ts`
- 环境校验：`backend/src/config/env.ts`
- 数据模型：`backend/prisma/schema.prisma`

---

该 README 旨在为后端开发者快速理解当前实现、运行方式和待升级区域。如需补充具体接口示例或 API 测试用例，可以继续扩展本文件。