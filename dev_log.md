# 开发日志：LaTeX → Typst 迁移

## 项目背景
本项目最初基于 LaTeX 生成简历 PDF，后期迁移到 Typst 以获得更快的编译速度、更小的镜像体积和更灵活的模板扩展能力。

## 开发阶段

### Phase 1：Typst 编译服务搭建
- [x] 新建 `typst-service/` 目录
- [x] 编写 `Dockerfile`，包含 Typst CLI、Python 运行环境、字体和依赖
- [x] 编写 `compile.sh`，作为 Typst 编译入口
- [x] 编写 `server.py`，提供 Flask REST API：
  - `POST /compile`
  - `GET /download/<cache_key>`
  - `GET /health`
- [x] 实现 Typst 缓存机制，避免重复编译
- [x] 更新 `docker-compose.yml`，替换原 LaTeX 服务并增加 `typst` 容器

### Phase 2：后端 Typst 迁移
- [x] 创建 `backend/src/services/typst.service.ts`
- [x] 用 Typst 源码替换后端旧 LaTeX 生成逻辑
- [x] 更新后端 API 路由，将模板 / PDF 请求指向 Typst 服务
- [x] 更新环境变量配置：`TYPST_SERVICE_URL`
- [x] 修改 Prisma schema 和数据字段，移除旧 `latexSource/latexTemplate`
- [x] 清理后端 LaTeX 代码与测试文件
- [x] 保留后端基础架构：Express、CORS、Helmet、rate limiter、错误处理中间件

### Phase 3：前端迁移与适配
- [x] 创建 `frontend/src/utils/typstGenerator.ts`
- [x] 更新 API 客户端调用，将 `latex` 字段替换为 `typst`
- [x] 更新简历编辑页面：`frontend/src/pages/ResumeEditorPage.tsx`
- [x] 按 Typst 渲染逻辑调整前端简历模型和 UI 文案

### Phase 4：清理与文档
- [x] 删除旧的 `latex-service/` 目录
- [x] 更新根目录 README 和项目说明
- [x] 清理项目中残留的 LaTeX / texlive / xelatex 引用
- [x] 检查 `docker-compose.yml`、`.env.example` 和 Vite 代理设置

### Phase 5：验证与稳定性检查
- [x] 成功启动 `typst-service` 容器并验证接口可用
- [x] 解决 Typst 服务字体问题，添加 Source Sans 3 + LXGW Neo XiHei
- [x] 修复容器间通信中的服务域名配置（`http://typst:5050`）
- [x] 运行后端测试与前端集成检查

## 关键成果
- Typst 生成链路已经就绪：前端 → 后端 API → Typst 服务 → PDF
- 简历数据已经可以被转换为 Typst 模板并生成 PDF
- Docker Compose 已支持以下服务：`frontend`、`backend`、`typst`、`db`、`redis`
- 项目已实现对 macOS Apple Silicon 和 Intel 平台的兼容支持

## 当前状态
- ✅ Typst 编译服务完成
- ✅ 后端 API 已替换为 Typst 生成逻辑
- ✅ 前端简历编辑与 PDF 生成功能已对接
- ✅ 旧 LaTeX 依赖已移除

## 需要继续关注的点
- `backend` 中仍有 JWT / 用户鉴权占位，如 `user-id-mock`
- 需要确认数据库迁移是否在当前环境中已完全应用
- 前端页面是否已覆盖全部简历字段与模板设置
- 生产部署时应清空 Typst 缓存卷，避免旧缓存与新引擎冲突

## 参考运行命令
- 启动项目：`docker-compose up --build`
- 后端开发：`cd backend && npm run dev`
- 前端开发：`cd frontend && npm run dev`
- Typst 服务本地调试：`cd typst-service && python3 server.py`

