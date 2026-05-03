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

## ✅ [已完成] 统一预览图生成与前端 PDF 生成逻辑

### 背景

之前模板预览图（`.webp`）和实际 PDF 的 Typst 源码由两套独立的逻辑维护，导致排版容易不一致。

### 实现结果

- [x] 迁移脚本至 `frontend/scripts/generate-template-previews.ts`
- [x] 使用 `tsx` 直接运行 TS 脚本
- [x] **复用前端生成逻辑**：脚本直接调用 `generateResumeTypst` 纯函数，彻底消除重复代码
- [x] **自动化配置**：脚本自动遍历 `RESUME_TEMPLATES` 配置，新增模板时无需修改脚本
- [x] **环境适配**：脚本运行时自动处理 Typst 文件路径映射，兼容浏览器 Worker 环境

### 文件变更清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `frontend/package.json` | 修改 | `generate:template-previews` 脚本改为使用 `tsx` |
| `frontend/scripts/generate-template-previews.ts` | 新建 | 基于 TS 的统一预览图生成脚本 |
| `frontend/scripts/generate-template-previews.mjs` | 删除 | 移除旧的、包含冗余逻辑的 JS 脚本 |

---

## ✅ [已完成] 職務経歴書编辑器增强（策略 B）

### 背景

職務経歴書（Shokumu Keirekisho）需要更结构化的数据输入，如项目名称、团队规模和技术栈。

### 实现结果

- [x] **数据模型扩展**：`RichTextBlock` 增加 `projectName`、`teamSize`、`technologies` 可选字段。
- [x] **转换逻辑增强**：`blocksToSection` 和 `sectionToBlocks` 自动同步这些元数据字段。
- [x] **UI 增强**：`RichTextEditor` 针对 `Shokumu Keirekisho` 模板开启 `showMetadata` 模式。
- [x] **结构化输入**：当 `H2` 块被聚焦时，下方自动展开项目、团队规模、技术栈输入框；若已有内容，则始终显示。
- [x] **渲染适配**：PDF 生成器自动根据这些字段生成加粗的项目名称、带括号的团队规模及独立的技术栈行。
- [x] **示例数据迁移**：更新 `SHOKUMU_SAMPLE_DATA`，将原描述中的技术栈等信息迁移到结构化字段中，使预览图更专业。

### 文件变更清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `frontend/src/types/richText.ts` | 修改 | `RichTextBlock` 增加元数据字段 |
| `frontend/src/utils/resumeTransforms.ts` | 修改 | 增强 Block <-> Section 转换逻辑 |
| `frontend/src/components/RichTextEditor/RichTextEditor.tsx` | 修改 | 增加 `showMetadata` 属性并传递 |
| `frontend/src/components/RichTextEditor/EditableBlock.tsx` | 修改 | 实现元数据输入 UI |
| `frontend/src/pages/ResumeEditorPage.tsx` | 修改 | 根据模板动态开启元数据编辑 |
| `frontend/src/utils/typstGenerators/shokumukeirekisho.ts` | 修改 | 适配结构化字段渲染 |
| `frontend/src/data/sampleResume.ts` | 修改 | 更新示例数据 |

---

## 📋 后续迭代（低优先级）


- [x] **ProfilePage 路由注册或移除**：已确认 `ProfilePage.tsx` 已作为死代码移除，并已清理 `README.md` 中的相关引用。

### 测试覆盖

- [x] **单元测试增强**：新建 `frontend/src/utils/typstGenerators/generators.test.ts`，涵盖所有 5 种模板的 Typst 源码生成逻辑验证。
- [x] **回归验证**：通过测试确保了结构化字段（projectName, teamSize, technologies）在 `Shokumu Keirekisho` 模板中的正确渲染，以及未知模板的 fallback 逻辑。
