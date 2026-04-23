# Web Resume Generator

一个基于 Typst 的 Web 简历生成器，支持可编辑简历内容、在线 PDF 生成和现代简历模板。

## 亮点

- **Typst PDF 生成**：使用 Typst 作为排版引擎，提供更快、更稳定的 PDF 输出。
- **React 编辑界面**：使用 React + Vite + Tailwind 构建，便于扩展和快速迭代。
- **现代简历模板**：基于 `awesome-cv` 风格模板，支持多种简历内容模块。
- **开发友好**：支持 Docker Compose 一键启动，适合本地开发和调试。

## 项目架构

- `frontend/`：React + TypeScript + Tailwind 前端应用
- `backend/`：Node.js + Express + TypeScript API 服务
- `typst-service/`：Flask Typst 编译服务，负责 Typst 到 PDF 的转换
- `data/`：示例简历数据
- `docker-compose.yml`：本地开发环境编排

## 服务说明

- 前端：`http://localhost:3000`
- 后端 API：`http://localhost:5001/api`
- Typst 服务：`http://localhost:5050`
- 数据库：PostgreSQL（`db` 容器）

## 主要功能

- 简历数据编辑：个人信息、教育、工作经验、技能、项目、语言、荣誉等
- 工作申请跟踪：Profile 页面提供工作申请和面试跟踪功能，包括申请状态、面试安排、统计和时间线
- 后端简历管理接口：`GET /api/v1/resumes`、`POST /api/v1/resumes`、`GET /api/v1/resumes/:id`、`PUT /api/v1/resumes/:id`、`DELETE /api/v1/resumes/:id`
- 工作申请管理接口：`GET /api/v1/applications`、`POST /api/v1/applications`、`GET /api/v1/applications/:id`、`PUT /api/v1/applications/:id`、`DELETE /api/v1/applications/:id`
- 面试管理接口：`GET /api/v1/applications/:id/interviews`、`POST /api/v1/applications/:id/interviews`
- Typst PDF 编译：`typst-service` 提供 `/compile` API
- 健康检查：`/health`
- Docker Compose 一键启动所有服务

## 快速启动

### 使用 Docker Compose（推荐）

```bash
docker-compose up --build
```

打开浏览器访问 `http://localhost:3000`。

### 本地开发

#### 1. Typst 服务

```bash
cd typst-service
docker build -t typst-service .
docker run -p 5050:5050 typst-service
```

#### 2. 后端

```bash
cd backend
npm install
cp .env.example .env
# 确保 .env 中 NODE_ENV=development，否则后端不会启动端口监听
npm run db:generate
npx prisma migrate dev
npm run dev
```

后端默认监听 `http://localhost:5001`。

> **注意**：本地开发需要先启动 PostgreSQL。macOS 用户可通过 `brew services start postgresql@18` 启动，或参考 PostgreSQL 官方文档。

#### 3. 前端

```bash
cd frontend
npm install
npm run dev
```

前端默认监听 `http://localhost:3000`，通过 Vite 代理将 `/api` 转发到 `localhost:5001`。

## 代码迁移说明

本项目已完成从 LaTeX 到 Typst 的迁移：

- `latex-service/` 已被移除
- 后端生成逻辑已切换至 `backend/src/services/typst.service.ts`
- Typst 编译由 `typst-service/server.py` 提供
- 前端已更新为 Typst 内容生成与后端对接

更多迁移细节请查看 `dev_log.md`。

## 本地环境变量

`docker-compose.yml` 中包含以下主要环境变量：

- `REACT_APP_API_URL=http://localhost:5001/api`
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://postgres:password@db:5432/resume_db`
- `TYPST_SERVICE_URL=http://typst:5050`
- `MAX_COMPILE_TIME=30`
- `CACHE_ENABLED=true`

## 数据库迁移

本地开发时，首次启动或 schema 变更后需要运行迁移：

```bash
cd backend
# 生成 Prisma Client
npm run db:generate

# 创建并应用迁移（开发环境）
npx prisma migrate dev

# 仅应用已有迁移（生产环境）
npm run db:migrate
```

## 运行测试与构建

### 后端

```bash
cd backend
npm run type-check   # TypeScript 类型检查
npm run build        # 编译到 dist/
npm test             # 运行单元测试
```

### 前端

```bash
cd frontend
npm run type-check   # TypeScript 类型检查
npm run build        # Vite 生产构建
npm test             # 运行单元测试
```

## API 文档

详见 [`backend/API.md`](backend/API.md)，包含所有端点的请求/响应说明。

## 说明

当前项目已完成 Typst 迁移和 Profile 页面重构为工作申请跟踪器。核心功能包括简历生成和工作申请管理。数据库迁移已验证，后端路由已测试通过，前后端构建均无错误。

## 许可证

MIT
