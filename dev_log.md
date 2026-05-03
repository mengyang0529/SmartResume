# 开发日志

## [计划] 添加日式職務経歴書（Shokumu Keirekisho）模板

### 背景

目前已有两种日式简历支持：
- **履歴書（Rirekisho）**：表格格式，简洁呈现学歴・職歴・免許・資格・志望の動機
- **Awesome-CV 系列**：西式简历，基于条目（entry/item）排版

需要新增 **職務経歴書（Shokumu Keirekisho）**，用于详细描述职业经历和项目经验，是日企招聘中常见的补充材料。与履歴書的核心区别在于：

| 维度 | 履歴書（Rirekisho） | 職務経歴書（Shokumu Keirekisho） |
|---|---|---|
| 格式 | 固定表格（JIS 标准） | 自由排版，段落式 |
| 经历描述 | 一行一条（公司+职位+日期） | 每条经历详细展开（项目、技术栈、职责、成果） |
| 侧重点 | 事实罗列 | 能力展示、项目细节、技术深度 |
| 篇幅 | 1-2 页 A4 | 2-5 页 A4 |

### 職務経歴書的标准结构

1. **基本情報**：氏名、生年月日、最終学歴、住所、連絡先
2. **職務要約**：职业概述（3-5 句话概括职业方向、核心优势、目标岗位）
3. **職務経歴**（核心）：
   - 期間（YYYY年MM月 ～ YYYY年MM月）
   - 所属会社名
   - プロジェクト名（可选）
   - チーム規模 / 役割
   - 使用技術（技术栈）
   - 担当業務・実績（详细描述，可含 bullet points）
4. **活かせるスキル・知識**：技能矩阵（语言、框架、工具、领域知识）
5. **資格**：资格证书列表
6. **自己PR**：自我推销（可选）

---

### 实现步骤

#### Step 1: 扩展数据模型（`types/resume.ts`）

`Entry` 接口新增職務経歴書专用的可选字段，不破坏现有模板：

```typescript
export interface Entry {
  id: string
  title: string          // 公司名
  subtitle: string       // 职位/役割
  location?: string      // 地点
  startDate: string
  endDate?: string
  description?: string   // 详细描述（担当業務・実績）
  highlights?: string[]  // 亮点/成果列表
  // --- 職務経歴書新增字段（全部可选） ---
  projectName?: string   // プロジェクト名
  teamSize?: string      // チーム規模
  technologies?: string  // 使用技術（逗号分隔）
}
```

#### Step 2: 创建 Typst 模板文件

新建 `frontend/public/templates/shokumukeirekisho/shokumukeirekisho.typ`：

- 页面设置：A4，上下左右 margins 约 15-20mm
- 字体：Noto Sans CJK JP（正文 10pt，标题 12pt）
- 排版逻辑：
  - 头部：基本情報区块（氏名、生年月日、最終学歴、住所、連絡先）
  - 職務要約：独立区块，带下划线标题
  - 職務経歴：每条经历为一个独立卡片/区块，包含：
    - 期間 + 会社名（加粗标题行）
    - プロジェクト名（如有，子标题）
    - チーム規模・役割（小字灰色）
    - 使用技術（标签式排版）
    - 担当業務・実績（正文段落 + bullet list）
  - 活かせるスキル・知識：分类列表（Languages / Frameworks / Tools / Domains）
  - 資格：列表
  - 自己PR：段落

#### Step 3: 创建 JS 生成器

新建 `frontend/src/utils/typstGenerators/shokumukeirekisho.ts`：

- `generateShokumuKeirekishoTypst(data, settings, skillsBlocks)`
- 日期格式：统一为 `YYYY年MM月`
- 技能处理：与 rirekisho 类似，按 category 分组
- 经历排序：按 startDate 倒序（最新在前）
- 经历详细渲染逻辑：
  - 如果 entry 有 `projectName` / `teamSize` / `technologies`，生成结构化区块
  - 如果只有 `description`，生成简化版（兼容现有数据）

#### Step 4: 注册模板

修改以下文件：

1. **`utils/typstGenerators/index.ts`**
   ```typescript
   import { generateShokumuKeirekishoTypst } from './shokumukeirekisho';
   const generators: Record<string, TypstGenerator> = {
     // ... existing
     shokumukeirekisho: generateShokumuKeirekishoTypst,
   };
   ```

2. **`data/templates.ts`**
   新增模板配置项：
   ```typescript
   {
     id: 5,
     slug: 'shokumukeirekisho',
     name: 'Shokumu Keirekisho',
     category: 'Japanese',
     description: 'Japanese career history document (職務経歴書) with detailed project experience, tech stacks, and achievements.',
     previewImage: '/template-previews/shokumukeirekisho.webp',
     settings: {
       colorScheme: 'awesome-red',
       fontSize: '10pt',
       paperSize: 'a4paper',
       sectionColorHighlight: false,
       headerAlignment: 'L',
       template: 'shokumukeirekisho',
     },
   }
   ```

3. **`compiler/compiler.worker.ts`**
   在 `ensureInitialized()` 中加载新模板：
   ```typescript
   const skResp = await fetch('/templates/shokumukeirekisho/shokumukeirekisho.typ')
   const skText = await skResp.text()
   await $typst.addSource('/shokumukeirekisho/shokumukeirekisho.typ', skText)
   ```

4. **`types/resume.ts` 中 `TemplateSettings.template`**
   扩展联合类型：
   ```typescript
   template?: 'classic' | 'modern' | 'art' | 'rirekisho' | 'shokumukeirekisho'
   ```

#### Step 5: 添加示例数据

在 `data/sampleResume.ts` 中新增 `SHOKUMU_SAMPLE_DATA`：

- 包含 2-3 条详细工作经历（带 projectName、teamSize、technologies）
- 職務要約段落
- 活かせるスキル・知識分类
- 資格列表
- 自己PR

#### Step 6: 持久化层适配

`useResumePersistence.ts` 中模板切换时的 sample data 选择逻辑，新增 `shokumukeirekisho` 分支：

```typescript
const data =
  templateSettings.template === 'rirekisho'
    ? RIREKISHO_SAMPLE_DATA
    : templateSettings.template === 'shokumukeirekisho'
      ? SHOKUMU_SAMPLE_DATA
      : SAMPLE_RESUME_DATA;
```

#### Step 7: 预览图

- 生成 `public/template-previews/shokumukeirekisho.webp`
- 尺寸参考现有预览图（约 4:5 比例）

#### Step 8: 编辑器 UX 微调（可选）

職務経歴書的每条工作经历需要更多字段输入，但目前编辑器使用 `RichTextBlock`（H1/H2/H3/bullet/paragraph），所有经历信息都压缩在 `description` 文本里。

**有两种策略：**

**策略 A（推荐，MVP）：** 继续使用现有 RichTextEditor，通过约定格式让用户在 description 中输入结构化信息（如 Markdown 列表），生成器负责解析。优点是改动最小，零 UI 变更。

**策略 B（增强版）：** 为 Shokumu Keirekisho 模板定制一个增强型编辑器区域，每个 entry 可填写 projectName、teamSize、technologies 等独立字段。优点是体验更好，但需要修改编辑器 UI 和数据流。

**MVP 采用策略 A**，后续迭代可考虑策略 B。

---

### 文件变更清单

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

### 验收标准

- [ ] 模板选择页面出现 "Shokumu Keirekisho" 卡片
- [ ] 点击后进入编辑器，加载示例数据（含详细工作经历）
- [ ] 预览 PDF 正确渲染職務経歴書格式（基本情報 → 職務要約 → 職務経歴 → スキル → 資格 → 自己PR）
- [ ] 每条工作经历展示：期間、会社名、プロジェクト名、チーム規模、使用技術、担当業務
- [ ] 日期格式统一为日式 `YYYY年MM月`
- [ ] 技能按 category 分组展示
- [ ] 无编译错误，现有模板不受影响
