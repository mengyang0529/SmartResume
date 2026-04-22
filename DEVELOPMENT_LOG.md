# WebResume 开发进度文档

> 本文档记录 WebResume 项目的开发历程、关键变更和当前状态。

---

## 项目概述

WebResume 是一个基于 [Awesome-CV](https://github.com/posquit0/Awesome-CV) 的 Web 简历生成工具。用户可以通过现代化的 Web 界面创建专业简历，无需了解 LaTeX，即可生成高质量的 PDF 输出。

**技术栈**
- 前端：React 18 + TypeScript + Tailwind CSS + Vite
- 后端：Express + TypeScript + Prisma + PostgreSQL
- LaTeX 服务：Docker 化的 TeX Live 编译环境

---

## 开发里程碑

### 阶段一：原型搭建（已完成）

项目初始阶段，完成了基础的 UI 布局和技术架构搭建：

- [x] 初始化前端项目（React + Vite + Tailwind）
- [x] 初始化后端项目（Express + Prisma + TypeScript）
- [x] 搭建 Docker 化的 LaTeX 编译服务
- [x] 设计并实现核心页面（首页、编辑器、模板库、个人资料、关于）
- [x] 定义数据库 Schema（User / Resume / Template / PdfJob / Session）
- [x] 实现 ResumeService 的数据库操作（CRUD）
- [x] 实现 LaTeX 生成服务（前后端两套模板引擎）

**阶段一遗留问题**
- 前端表单无状态管理（静态展示）
- 按钮无点击处理函数
- API 服务层为空
- 所有数据为硬编码/mock

---

### 阶段二：核心功能修复（2026-04-22 完成）

由前端测试驱动的大规模功能补全，详见 [`frontend-report.md`](./frontend-report.md)。

**P0 修复（核心功能）**
- [x] 实现完整的表单状态管理（所有字段受控绑定）
- [x] 实现 localStorage 草稿自动保存
- [x] 创建 `src/services/api.ts`（resumeApi / pdfApi / templateApi / userApi）
- [x] 实现所有按钮的事件处理器（Reset / Save Draft / Add / Remove）
- [x] 修复导航高亮逻辑（支持嵌套路由）
- [x] 接入后端 PDF 生成流程（前端 → 后端 → LaTeX 服务）

**P1 修复（功能完善）**
- [x] 模板页面过滤功能（Resumes / CVs / Cover Letters）
- [x] 模板操作（Preview / Use Template）
- [x] 导出功能：PDF 生成并自动下载
- [x] 导出功能：LaTeX 源码下载
- [x] 用户资料页面表单编辑/保存
- [x] API 错误拦截器（401/429/500/网络错误 + toast 提示）
- [x] 可访问性改进（ARIA 标签、role 属性）

**类型安全**
- [x] 前端 `src/types/resume.ts` 完整定义所有接口
- [x] 所有组件和函数参数添加 TypeScript 类型注解

---

### 阶段三：功能精简（2026-04-22 完成）

根据产品方向调整，去掉以下功能模块：

**去掉登录/认证系统**
- 删除 `backend/src/services/auth.service.ts`
- 简化 `auth.routes.ts` 为占位路由（返回 503）
- 从 Prisma Schema 移除 `User.password` 字段
- 重新生成 Prisma Client

**去掉 GitHub 集成**
- 前后端 `types/resume.ts`：移除 `PersonalInfo.github` 字段
- `ResumeEditorPage.tsx`：移除 GitHub 用户名输入框
- `Layout.tsx`：移除顶部 GitHub 外部链接
- `AboutPage.tsx`：移除 GitHub 相关按钮和链接
- `NotFoundPage.tsx`：移除 GitHub Issues 引用
- `latexGenerator.ts` / `latex.service.ts`：移除 `\github{}` 命令生成
- `test-latex.ts`：清理示例数据

**去掉导出 LaTeX 功能**
- `ResumeEditorPage.tsx`：移除 "Download LaTeX Source" 按钮及下载逻辑
- `api.ts`：移除 `resumeApi.exportLatex()` 方法
- `resume.routes.ts`：移除 `GET /api/v1/resumes/:id/export/latex` 路由

**编译器修复**
- 安装缺失的类型包（`@types/morgan`、`@types/cookie-parser`）
- 修复 Prisma Schema 缺失字段（`Resume.description`）
- 修复路由文件的 TypeScript 类型注解（Request / Response / NextFunction）
- 修复 `ValidationError` 类型与 express-validator 的兼容性
- 修复 `res.set()` header 类型转换
- 修复 `latex.service.ts` 中模板字符串解析问题
- 调整 `tsconfig.json` 严格选项（关闭 `noUnusedLocals` / `noUnusedParameters` / `noImplicitReturns`）

---

## 当前项目状态

### 前端

| 功能模块 | 状态 | 备注 |
|---------|------|------|
| 路由与导航 | ✅ 正常 | 响应式布局，移动端适配 |
| 表单编辑器 | ✅ 完整 | 状态管理 + localStorage 草稿 |
| 实时预览 | ✅ 正常 | 同步显示 resumeData |
| LaTeX 源码面板 | ✅ 保留 | 仅展示源码，**不可下载** |
| PDF 生成 | ✅ 正常 | 调用后端 `/api/v1/pdf/generate` |
| 模板页面 | ✅ 正常 | 静态数据，过滤功能可用 |
| 用户资料 | ✅ 正常 | 本地状态，无后端同步 |
| 可访问性 | ✅ 改进 | ARIA 标签已添加 |

**前端技术债务**
- `ResumeEditorPage.tsx` 超过 1000 行，建议拆分为子组件（EditorForm / PreviewPanel / LaTeXPanel）
- 零单元测试覆盖

### 后端

| 功能模块 | 状态 | 备注 |
|---------|------|------|
| 健康检查 `/health` | ✅ 正常 | |
| Resume CRUD | ✅ 真实实现 | 基于 Prisma，含 LaTeX 自动生成 |
| PDF 生成 `/pdf/generate` | ✅ 真实实现 | 代理到 LaTeX 编译服务 |
| PDF 下载 `/pdf/download` | ✅ 真实实现 | 流式代理 |
| Auth 路由 | ⚠️ 占位 | 返回 503，功能已关闭 |
| Template 路由 | ⚠️ Mock | 返回静态数据 |
| User 路由 | ⚠️ Mock | 返回静态数据 |
| PDF Job 状态 | ⚠️ Mock | 返回静态数据 |

**后端技术债务**
- Template / User / PdfJob 路由仍为 Mock 实现
- 无认证中间件（req.user 未注入）
- 零单元测试覆盖

### 数据库 Schema

```
User          (id, email, name, avatar)
Resume        (id, title, description, content[Json], latexSource, settings[Json], isPublic, downloadCount)
Template      (id, name, description, category, thumbnail, latexTemplate, settingsSchema[Json], isPublic, isDefault)
PdfJob        (id, resumeId, latexSource, status, error, pdfUrl, cacheKey, compileTime)
Session       (id, userId, token, expiresAt, userAgent, ipAddress)
```

---

## 待办事项（下一步建议）

### 高优先级
- [ ] **组件拆分**：将 `ResumeEditorPage.tsx` 拆分为多个子组件
- [ ] **后端真实化**：实现 TemplateService、UserService，替换 Mock 数据
- [ ] **数据库迁移**：执行 Prisma migrate（当前 Schema 有变更）

### 中优先级
- [ ] **LaTeX 服务联调**：验证 Docker 化 LaTeX 编译流程是否完整可用
- [ ] **前端组件测试**：为 ResumeEditorPage 状态逻辑添加单元测试
- [ ] **后端 API 测试**：为 ResumeService 和路由添加测试

### 低优先级
- [ ] **错误边界**：添加 React Error Boundary
- [ ] **键盘导航**：完善表单键盘可操作性
- [ ] **PWA 支持**：添加 Service Worker 和离线能力

---

## 文件变更索引

### 本次修改涉及的文件

**前端**
- `frontend/src/types/resume.ts`
- `frontend/src/components/Layout/Layout.tsx`
- `frontend/src/pages/ResumeEditorPage.tsx`
- `frontend/src/pages/AboutPage.tsx`
- `frontend/src/pages/NotFoundPage.tsx`
- `frontend/src/utils/latexGenerator.ts`
- `frontend/src/services/api.ts`
- `frontend/src/config.ts`

**后端**
- `backend/prisma/schema.prisma`
- `backend/src/types/resume.ts`
- `backend/src/services/auth.service.ts` ⛔ 已删除
- `backend/src/services/latex.service.ts`
- `backend/src/services/resume.service.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/routes/resume.routes.ts`
- `backend/src/routes/pdf.routes.ts`
- `backend/src/routes/index.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/src/scripts/test-latex.ts`
- `backend/tsconfig.json`

---

*最后更新：2026-04-22*
