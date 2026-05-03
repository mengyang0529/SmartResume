# 开发日志

---

## ✅ [已完成] 添加日式職務経歴書（Shokumu Keirekisho）模板

### 背景

已有两种日式简历支持：
- **履歴書（Rirekisho）**：表格格式，简洁呈现学歴・職歴・免許・資格・志望の動機
- **Awesome-CV 系列**：西式简历，基于条目（entry/item）排版

新增 **職務経歴書（Shokumu Keirekisho）**，用于详细描述职业经历和项目经验，是日企招聘中常见的补充材料。

| 维度 | 履歴書（Rirekisho） | 職務経歴書（Shokumu Keirekisho） |
|---|---|---|
| 格式 | 固定表格（JIS 标准） | 自由排版，段落式 |
| 经历描述 | 一行一条（公司+职位+日期） | 每条经历详细展开（项目、技术栈、职责、成果） |
| 侧重点 | 事实罗列 | 能力展示、项目细节、技术深度 |
| 篇幅 | 1-2 页 A4 | 2-5 页 A4 |

### 職務経歴書的标准结构

1. **基本情報**：氏名、生年月日、最終学歴、住所、連絡先
2. **職務要約**：职业概述
3. **職務経歴**（核心）：期間、所属会社名、プロジェクト名、チーム規模/役割、使用技術、担当業務・実績
4. **活かせるスキル・知識**：技能矩阵
5. **資格**：资格证书列表
6. **自己PR**：自我推销（可选）

### 实现结果

| Step | 内容 | 状态 |
|---|---|---|
| 1 | 扩展 `Entry` 接口（新增 `projectName` / `teamSize` / `technologies`）；扩展 `TemplateSettings.template` 联合类型 | ✅ |
| 2 | 创建 `public/templates/shokumukeirekisho/shokumukeirekisho.typ` | ✅ |
| 3 | 创建 `utils/typstGenerators/shokumukeirekisho.ts` | ✅ |
| 4 | 注册模板（`index.ts` / `templates.ts` / `compiler.worker.ts` / `types/resume.ts`） | ✅ |
| 5 | 添加 `SHOKUMU_SAMPLE_DATA` 示例数据 | ✅ |
| 6 | `useResumePersistence.ts` sample data 选择逻辑适配 | ✅ |
| 7 | 生成 `shokumukeirekisho.webp` 预览图 | ✅ |
| 8 | 编辑器采用策略 A（继续使用现有 RichTextEditor，不新增独立字段） | ✅ |

### 文件变更清单（已落地）

| 文件 | 操作 | 说明 |
|---|---|---|
| `types/resume.ts` | 修改 | Entry 新增可选字段；TemplateSettings 扩展 template 联合类型 |
| `data/templates.ts` | 修改 | 新增 shokumukeirekisho 模板配置 |
| `data/sampleResume.ts` | 修改 | 新增 SHOKUMU_SAMPLE_DATA |
| `utils/typstGenerators/shokumukeirekisho.ts` | 新建 | 職務経歴書 Typst 生成器 |
| `utils/typstGenerators/index.ts` | 修改 | 注册新生成器 |
| `public/templates/shokumukeirekisho/shokumukeirekisho.typ` | 新建 | Typst 模板文件 |
| `compiler/compiler.worker.ts` | 修改 | Worker 加载新模板 |
| `hooks/useResumePersistence.ts` | 修改 | Sample data 选择逻辑 |
| `public/template-previews/shokumukeirekisho.webp` | 新建 | 模板预览图 |

---

## 🔧 [待办] 统一预览图生成与前端 PDF 生成逻辑

### 问题描述

当前模板预览图（`.webp`）和实际 PDF 的 Typst 源码由**两套完全独立的代码**生成：

| | 预览图 | 前端 PDF |
|---|---|---|
| 入口 | `scripts/generate-template-previews.mjs` | `utils/typstGenerators/*.ts` |
| 运行环境 | Node.js + Typst CLI | 浏览器 + Web Worker + typst.ts wasm |
| 数据输入 | `src/data/sample-xxx.md` | `ResumeData`（运行时状态） |
| Typst 拼接 | `buildAwesomeCvTypst()` / `buildRirekishoTypst()` / `buildShokumuKeirekishoTypst()` | `generateAwesomeCvTypst()` / `generateRirekishoTypst()` / `generateShokumuKeirekishoTypst()` |

**风险**：
- 修改模板排版时，容易只改前端而漏改预览图脚本，导致预览图与实际 PDF 不一致
- 维护成本高（同一套 Typst 拼接逻辑写两遍）
- 新增模板时必须同时维护两套生成逻辑

### 方案对比

| 方案 | 描述 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|---|
| **A. 脚本直接复用前端生成器** | 脚本通过 tsx/ts-node 直接 import `utils/typstGenerators/*.ts` 的纯函数，传入构造好的 `ResumeData` | 零重复代码，单点维护 | 需要解决 TS→Node 的运行问题（tsx / ts-node） | ⭐ 推荐 |
| **B. 抽离共享生成模块** | 把 Typst 拼接逻辑抽到 `shared/typst-generators/`（纯 JS/TS，不依赖 React），前端和脚本共同 import | 彻底解耦，两边都干净 | 需要重构目录，改动面较大 | 长期可行 |
| **C. 脚本调用前端构建产物** | 前端 build 时把生成器编译为 ESM，脚本直接 import 产物 | 不需要 TS 运行时 | 增加了 build 步骤的耦合 | 一般 |
| **D. 保持现状，加同步注释** | 在脚本和生成器文件顶部加注释，提醒修改时必须同步 | 零重构成本 | 靠人记忆，迟早会漏 | 短期兜底 |

### 推荐方案：A（脚本复用前端生成器）

`utils/typstGenerators/*.ts` 已经是**纯函数**（只接收 data/settings，返回字符串，不依赖 React/DOM/Worker），理论上可以直接在 Node.js 运行。

实施步骤：

1. **改造脚本运行方式**
   - 将 `generate-template-previews.mjs` 改为 `.mts`（或保持 `.mjs` 但用 `tsx` 执行）
   - 安装 `tsx` 作为 devDependency：`npm install -D tsx`
   - package.json 脚本改为：`"generate:template-previews": "tsx scripts/generate-template-previews.ts"`

2. **改造数据准备**
   - 脚本不再自己解析 Markdown 拼接 Typst
   - 直接 import 前端的 sample data：`SAMPLE_RESUME_DATA`、`RIREKISHO_SAMPLE_DATA`、`SHOKUMU_SAMPLE_DATA`
   - 或者通过 `parseMarkdownResume()` 把 `sample-xxx.md` 转成 `ResumeData`

3. **调用前端生成器**
   ```typescript
   import { generateResumeTypst } from '../src/utils/typstGenerators/index';
   
   const source = generateResumeTypst(resumeData, template.settings);
   // 然后 typst compile → magick → webp
   ```

4. **删除冗余代码**
   - 删除脚本中的 `buildAwesomeCvTypst()` / `buildRirekishoTypst()` / `buildShokumuKeirekishoTypst()`
   - 删除脚本中的 Markdown 解析逻辑（如果改用 import sample data）

### 验收标准

- [ ] `npm run generate:template-previews` 成功生成所有 5 张预览图
- [ ] 删除脚本中所有 `buildXxxTypst()` 函数
- [ ] 预览图与实际 PDF 的 Typst 源码来自同一套生成器
- [ ] 新增第 6 个模板时，只需维护 `utils/typstGenerators/*.ts`，无需修改脚本

---

## 📋 后续迭代（低优先级）

### 職務経歴書编辑器增强（策略 B）

当前職務経歴書采用 **策略 A**（MVP）：继续使用现有 RichTextEditor，所有经历信息压缩在 `description` 文本中。

未来可考虑为 Shokumu Keirekisho 定制增强型编辑器：
- 每条经历可独立填写 `projectName`、`teamSize`、`technologies` 字段
- 在 `ResumePersonalInfoSection` 或 `RichTextEditor` 旁增加结构化输入面板
- 需要评估：改动面较大，收益是 UX 更好，但当前策略 A 已满足基本使用

### ProfilePage 路由注册或移除

`pages/ProfilePage.tsx` 是一个完整的 Job Application Tracker 页面，但 `App.tsx` 路由表中没有 `/profile` 路径。需要决策：
- 加路由 → 在导航栏增加 Profile 入口
- 删除 → 移除死代码

### 测试覆盖

`utils/resumeTransforms.test.ts` 目前只有一处测试文件，可以考虑为 `typstGenerators/*.ts` 添加单元测试（验证生成器输出包含预期 Typst 语法）。
