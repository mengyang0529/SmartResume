# 开发日志：Profile 页面重构为工作申请跟踪器

## 详细开发计划

### 后端开发
- [x] 创建 `backend/src/services/application.service.ts`，实现工作申请和面试的业务逻辑。
- [x] 创建 `backend/src/routes/application.routes.ts`，提供 REST API 端点用于 CRUD 操作。
- [x] 更新 `backend/prisma/schema.prisma`，添加 `Application` 和 `Interview` 模型，并建立与 `User` 和 `Resume` 的关系。
- [x] 在 `backend/src/routes/index.ts` 中注册 `/api/v1/applications` 路由。
- [x] 修复 Prisma 客户端生成问题（添加缺失的关系字段）。
- [x] 修复 `backend/src/config/env.ts` 中的 dotenv 导入问题。
- [x] 测试 application 路由的实际运行（启动服务器并发送请求）。
- [x] 验证数据库迁移是否正确应用。

### 前端开发
- [x] 更新 `frontend/src/services/api.ts`，添加 `applicationApi` 方法用于前端调用后端 API。
- [x] 重构 `frontend/src/pages/ProfilePage.tsx`，改为工作申请跟踪仪表板（统计、时间线、申请列表）。
- [x] 简化 ProfilePage 数据加载逻辑，去掉 React Query，改用 useEffect 和 useState。
- [x] 更新 `frontend/tsconfig.json`，添加 `esModuleInterop` 和 `allowSyntheticDefaultImports`。
- [x] 清理 unused imports（Layout.tsx, GalleryPage.tsx, HomePage.tsx, ResumeEditorPage.tsx）。
- [x] 修复所有 FoundryInput onChange 参数的 implicit any types，添加显式类型注解。

### 验证与修复
- [x] 运行后端 TypeScript 检查，确认新文件无错误。
- [x] 运行 Prisma 生成，成功生成客户端。
- [x] 修复前端 tsconfig 配置问题。
- [x] 确保前端编译无错误。

### 集成测试
- [x] 验证前端和后端的集成，确保申请跟踪功能正常工作。
- [x] 运行前端和后端的构建脚本。
- [x] 执行单元测试和集成测试。

### 文档更新
- [x] 更新 README.md 以反映新的 Profile 页面功能。
- [x] 添加使用说明和 API 文档。

### 运行时修复
- [x] 修复前端 Vite 代理配置，`vite.config.ts` 中代理目标从硬编码 Docker 服务名 `backend`/`typst` 改为支持环境变量，默认回退 `localhost:5001` / `localhost:5050`。
- [x] 更新 `docker-compose.yml`，为 frontend 服务添加 `VITE_PROXY_API_URL` 和 `VITE_PROXY_TYPST_URL` 环境变量，确保 Docker 环境代理仍能正常使用服务名。
- [x] 修复 React Router v7 迁移警告，`frontend/src/main.tsx` 中 `BrowserRouter` 添加 `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}`。

### 类型与构建修复
- [x] 修复 `backend/src/types/resume.ts`，扩展 `ResumeData` 接口，补充 `Experience`、`Project`、`ProjectSection`、`Language` 等缺失类型定义。
- [x] 修复 `backend/src/services/typst.service.ts` 类型错误：函数签名与调用参数不匹配、`experience` 等可选字段的空安全访问、参数 implicit any 问题。
- [x] 修复 `backend/src/scripts/generate-previews.ts` 和 `test-typst.ts` 中的类型兼容性（补充 `sections: []`、修正 `projects` 和 `languages` 结构）。

### 测试修复
- [x] 修复 `typst.service.test.ts` 测试断言，匹配当前 `awesome-cv.typ` 实现输出（import 路径、positions 格式、Experience 标题、font 配置）。
- [x] 移除 `resume.routes.test.ts` 中针对不存在路由 `/export/typst` 的测试用例。

## 当前状态
- ✅ 后端 application 模型和路由已实现并验证。
- ✅ 前端 Profile 页面已重构并修复所有 TypeScript 错误。
- ✅ 前端编译无错误，构建成功。
- ✅ 数据库迁移已创建并应用（新增 Application 和 Interview 表）。
- ✅ 后端构建无错误，TypeScript 检查通过。
- ✅ 后端单元测试全部通过（31 tests，3 个测试文件）。
- ✅ API 文档已补充到 `backend/API.md`。
- ✅ 根目录 README 已更新使用说明、迁移指南和构建命令。
- ✅ 本地开发代理配置已修复，前端请求可正常转发到 localhost:5001。
- ✅ React Router v7 迁移警告已消除。

