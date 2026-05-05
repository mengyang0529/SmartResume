  Kimi审核结果
  一、当前项目中 AI 容易误解的命名
  问题 1：moduleBlocks — "module" 是什么？
  const [moduleBlocks, setModuleBlocks] = useState<RichTextBlock[]>([]);
  AI 看到 moduleBlocks，字面理解是"模块级别的块"。但它实际存的是主编辑区内容（工作经历、学歴、任意 section）。module 这个词在这里完全没有语义价值。
  建议改为：mainBlocks 或 contentBlocks。后者更直白。
  问题 2：skillsBlocks — 语义已经被污染
  skillsBlocks?: RichTextBlock[];
  在 Awesome-CV 中它是"技能列表"，在 Rirekisho 中它是"志望の動機"，在 Shokumukeirekisho 中它是"自己PR"。AI 读代码时会字面理解为"skills"，然后遇到 rirekisho 生成器时就会产生认知冲突。
  建议改为：secondaryBlocks 或 supplementaryBlocks。让名称描述"位置"而非"内容"。
  问题 3：awesomeCv.ts — 用具体模板名命名生成器
  // utils/typstGenerators/awesomeCv.ts
  export function generateAwesomeCvTypst(...) { ... }
  AI 会理解为"这个函数专门给 Awesome-CV 模板用的"。但实际上它也给 classic 和 modern 用。命名暗示了排他性，与事实矛盾。
  建议改为：westernResume.ts / generateWesternResumeTypst()。描述风格而非具体模板。
  问题 4：blocksToSection / blocksToModules — "modules" 和 "sections" 是同义词
  blocksToSection(blocks, sectionId)   // 把 blocks 转成 ResumeSection
  blocksToModules(blocks)              // 把 blocks 转成 ResumeSection[]
  modulesToBlocks(sections)            // 把 ResumeSection[] 转成 blocks
  AI 看到这四个函数会困惑：section 和 module 到底什么区别？它们实际就是同一事物的两种叫法。
  建议：统一用 resumeSection 或统一废弃（迁移后不再保留）。
  问题 5：pdfConverter.ts — 名字暗示"转换"，实际可能只是"下载"
  // utils/pdfConverter.ts
  AI 会字面理解为"把某种格式转成 PDF"。如果文件里实际是 downloadPdf()，那就是命名撒谎。
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  二、当前文件夹结构的混乱
   路径                     问题
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   src/compiler/            只有一个 compiler.worker.ts。目录层级过高，内容太少。"compiler" 太泛，实际是 Typst 编译。
   src/services/            目录存在但可能是空/死代码。AI 会以为这里是"业务逻辑层"，实际没有。
   src/data/ + src/types/   types/resume.ts 里有 @deprecated 的旧类型，data/sampleBlocks.ts 里有 blocks 样本。两者边界模糊。
   src/utils/               太大太杂：PDF、照片、文本、存储、Typst 生成器、Markdown 解析……全部丢在一个筐里。
   src/test/                包含 setup.ts（Vitest 配置）和 sampleResume.ts（测试数据）。后者应该和 data/ 放在一起。
   src/components/import/   唯一一个按功能子组织的组件目录。其他组件全部平铺在 components/ 下。结构不一致。
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  三、命名规范：让 AI 无法误解
  原则 1：用"位置/角色"命名，不用"内容"命名
  当同一数据在不同场景下承载不同内容时，不要根据内容命名。
  ❌ skillsBlocks        → AI 理解为"技能"
  ✅ supplementaryBlocks → AI 理解为"补充编辑区的 blocks"

  ❌ awesomeCv.ts        → AI 理解为"Aweome-CV 专属"
  ✅ westernResume.ts    → AI 理解为"西式简历风格"
  原则 2：消除同义词
  代码中同一个概念只能有一个词。
  ❌ section / module / category 混用
  ✅ 统一用 section，或统一废弃旧模型

  ❌ content / text / body / value 混用
  ✅ RichTextBlock 统一用 content
  原则 3：动词 + 名词，不要省略
  ❌ convert()           → 转换什么？
  ✅ convertBlocksToMarkdown()

  ❌ handleChange()      → 处理什么变化？
  ✅ handlePersonalInfoChange()
  原则 4：布尔值用 is/has/should 前缀
  ❌ loading: boolean
  ✅ isLoading: boolean

  ❌ sample: boolean
  ✅ isSampleData: boolean
  原则 5：函数名必须暴露副作用
  ❌ persist()           → 是读取还是写入？
  ✅ loadFromStorage() / saveToStorage()

  ❌ compile()           → 返回什么？有副作用吗？
  ✅ compileTypstToPdf() → 明确输入输出
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  四、文件夹结构：按功能域组织
  当前是按技术类型组织（components/、hooks/、utils/）。这是小项目的默认做法，但会导致：
  • 修改一个功能要跨 4 个目录
  • utils/ 变成垃圾筐
  • AI 无法从目录结构推断业务边界
  推荐改为 Feature-Based 结构：
  src/
  ├── app/                    # 应用壳（路由、全局样式、Provider）
  │   ├── App.tsx
  │   ├── router.tsx
  │   └── providers.tsx
  │
  ├── features/               # 按功能域组织（核心！）
  │   ├── editor/             # 简历编辑器功能
  │   │   ├── components/     # RichTextEditor, Toolbar, SectionCard...
  │   │   ├── hooks/          # useEditorState, useAutoSave...
  │   │   ├── services/       # markdownParser, markdownGenerator
  │   │   ├── types.ts        # 该功能域的局部类型
  │   │   └── utils.ts        # 该功能域的局部工具
  │   │
  │   ├── template-renderer/  # Typst 编译 + 生成器
  │   │   ├── worker/
  │   │   │   └── typst.worker.ts
  │   │   ├── generators/
  │   │   │   ├── westernResume.ts      # 原 awesomeCv.ts
  │   │   │   ├── rirekisho.ts
  │   │   │   ├── shokumukeirekisho.ts
  │   │   │   └── shared.ts
  │   │   └── hooks/
  │   │       └── useTypstCompiler.ts
  │   │
  │   └── import-wizard/      # 导入向导
  │       ├── components/
  │       │   ├── ChoiceModal.tsx
  │       │   ├── StepCard.tsx
  │       │   └── ...
  │       └── ...
  │
  ├── shared/                 # 全应用共享（真正通用的东西）
  │   ├── components/         # Layout, ErrorBoundary
  │   ├── hooks/              # useLocalStorage（如果有的话）
  │   ├── utils/              # id.ts, download.ts, text.ts
  │   └── types/              # 全局类型（尽量少）
  │
  ├── data/                   # 静态配置
  │   ├── templates.ts
  │   └── sampleData.ts       # 合并 sampleBlocks.ts + sampleResume.ts
  │
  └── main.tsx
  关键变化：
  • utils/typstGenerators/ → features/template-renderer/generators/
  • components/import/ → features/import-wizard/components/
  • compiler/ → features/template-renderer/worker/
  • test/setup.ts → vitest.setup.ts（放到项目根或 config 目录）
  • services/ 如果为空则删除
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  五、给 AI 的命名/结构审核 Prompt
  你是一位代码语义分析师。你的任务不是检查代码逻辑是否正确，而是检查：
  **代码是否能通过命名和结构"自我解释"，让阅读者（包括 AI）无需读实现就能理解设计意图。**

  ## 审核维度

  ### D1 - 命名诚实性（最高优先级）
  检查每个标识符（变量、函数、类、文件）是否"名副其实"：
  - 名称描述的是**实际行为**，还是**期望行为**？
  - 名称是否暗示了不存在的信息？（如 awesomeCv.ts 实际也给 modern 用）
  - 布尔值是否有 is/has/should 前缀？
  - 函数名是否暴露了副作用？（如 persist() 到底是读还是写？）

  对每处问题输出：
  [D1] 文件:行号 - 命名不诚实 当前：function persist(data) 问题："persist" 没有说明是读取还是写入。AI 会字面理解为"持久化" 建议：拆分为 loadFromStorage() 和 saveToStorage(data)

  ### D2 - 消除同义词
  检查同一概念是否用了不同的词：
  - 是否有 section / module / block / entry 混用？
  - 是否有 content / text / body / value 混用？
  - 同一数据类型在不同文件中是否有不同的命名？

  对每处问题输出：
  [D2] 跨文件命名不一致 概念："主编辑区的 block 列表" 在 A.ts 中叫：moduleBlocks 在 B.ts 中叫：mainBlocks 建议：统一为 contentBlocks，因为"module"在此无意义

  ### D3 - 抽象层级泄漏
  检查命名是否暴露了不该暴露的实现细节：
  - 组件名是否包含了技术实现？（如 `useLocalForage` 应该叫 `usePersistentState`）
  - 工具函数是否绑定了具体技术？（如 `parseMarkdown` 应该叫 `parseImportFormat`）
  - 类型名是否包含了"Block"等数据结构细节？

  对每处问题输出：
  [D3] 抽象层级不当 当前：useLocalForage() 问题：Hook 暴露了存储实现是 localforage。如果要换成 IndexedDB 直接 API，Hook 名就撒谎了。 建议：usePersistentStorage()，内部实现不暴露

  ### D4 - 文件夹结构语义
  检查目录结构是否能反映业务边界：
  - 同一功能的文件是否分散在不同目录？
  - 目录是否变成了"垃圾桶"？（如 utils/ 是否有不相关的文件？）
  - 目录名是否与技术实现绑定？（如 "hooks/" 不如 "state-management/" 描述意图）

  对每处问题输出：
  [D4] 结构混乱 问题：utils/ 目录包含 typstGenerators/、markdownParser.ts、download.ts、photo.ts。 建议：按功能域拆分：
  • features/template-renderer/generators/
  • features/editor/services/
  • shared/utils/

  ## 输出要求

  1. 对每处问题，必须说明：**"AI 读到这里会怎么理解"** vs **"实际代码在做什么"**
  2. 提供具体的重命名建议，不是抽象的"改个好名字"
  3. 如果某个命名很好，明确说"这里很好，命名准确反映了抽象"
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  六、针对你当前项目的具体建议
  立即可以改的小重构 [DONE]
   当前                       改为                           理由
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   moduleBlocks               contentBlocks                  "module" 无意义，"content" 描述位置
   skillsBlocks               supplementaryBlocks            消除语义污染，描述位置而非内容
   awesomeCv.ts               westernResume.ts               描述风格而非具体模板
   generateAwesomeCvTypst()   generateWesternResumeTypst()   同上
   compiler.worker.ts         typst.worker.ts                明确技术栈
   pdfConverter.ts            pdfToImage.ts                  描述实际行为（从 PDF 转图片）
   useResumeEditor()          useEditorState()               消除冗余的 "Resume"
   useResumeCompile()         usePdfCompiler()               明确产出物是 PDF
   useResumePersistence()     useEditorPersistence()         描述行为而非抽象
  中期结构调整 [IN PROGRESS]
  1. src/services/ — [DONE] 已删除
  2. src/test/sampleResume.ts → [DONE] 移到 src/data/sampleResume.ts
  3. src/test/setup.ts → [DONE] 移到项目根 vitest.setup.ts
  4. src/utils/typstGenerators/ → 移到 src/features/template-renderer/generators/
  5. src/compiler/ → 移到 src/features/template-renderer/worker/
  6. src/components/import/ → 移到 src/features/import-wizard/components/
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  核心原则总结：
  ▌ 命名是代码和阅读者之间的契约。如果命名撒谎，AI 会信；如果命名模糊，AI 会猜；如果命名暴露实现，AI 会被绑定。

