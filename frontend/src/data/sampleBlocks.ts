import { RichTextBlock } from '@app-types/richText';

// --- Awesome-CV / Classic ---
export const SAMPLE_CLASSIC_CONTENT: RichTextBlock[] = [
  { id: 'b1', type: 'h1', content: 'Education' },
  {
    id: 'b2',
    type: 'h2',
    content: 'Institute of Theoretical Chronodynamics',
    rightContent: 'Aether City',
  },
  {
    id: 'b3',
    type: 'h3',
    content: 'Ph.D. in Multimodal Logic & Synthetics',
    rightContent: 'Sept 2015 -- June 2019',
  },
  {
    id: 'b4',
    type: 'bullet',
    content: 'Recipient of the "Mobius Strip" Medal for Theoretical Excellence.',
  },
  { id: 'b5', type: 'h1', content: 'Professional Experience' },
  { id: 'b6', type: 'h2', content: 'kakuti Technologies', rightContent: 'Remote' },
  {
    id: 'b7',
    type: 'h3',
    content: 'Lead Systems Architect',
    rightContent: 'March 2021 -- Present',
  },
  {
    id: 'b8',
    type: 'bullet',
    content:
      'Spearheaded the design of the "Eternal Flame" framework, boosting data throughput efficiency by 350%.',
  },
  {
    id: 'b9',
    type: 'bullet',
    content:
      'Managed a distributed team of 50 virtual entities, achieving a 100% zero-latency delivery rate.',
  },
];

export const SAMPLE_SKILLS_SUPPLEMENTARY: RichTextBlock[] = [
  { id: 's1', type: 'h1', content: 'Skills' },
  { id: 's2', type: 'h2', content: 'Languages' },
  { id: 's3', type: 'h3', content: 'Lumina+, VoidScript, Neo-Python, BinaryFlow' },
  { id: 's4', type: 'h2', content: 'Frameworks' },
  { id: 's5', type: 'h3', content: 'Ethereal Framework, Ghost-V, DeepCore 9.0' },
];

// --- Rirekisho (JIS) ---
export const SAMPLE_RIREKISHO_CONTENT: RichTextBlock[] = [
  { id: 'r1', type: 'h1', content: '学歴・職歴' },
  { id: 'r2', type: 'h2', content: '東京理科大学', rightContent: '2014-04' },
  { id: 'r3', type: 'paragraph', content: '工学部情報工学科 入学' },
  { id: 'r4', type: 'h2', content: '東京理科大学', rightContent: '2018-03' },
  { id: 'r5', type: 'paragraph', content: '工学部情報工学科 卒業' },
];

export const SAMPLE_RIREKISHO_SUPPLEMENTARY: RichTextBlock[] = [
  { id: 'r6', type: 'h1', content: '免許・資格' },
  { id: 'r7', type: 'paragraph', content: '基本情報技術者試験', rightContent: '2018-04' },
  { id: 'r8', type: 'h1', content: '志望の動機、自己PR、趣味など' },
  {
    id: 'r9',
    type: 'paragraph',
    content:
      '学生時代からものづくりに興味を持ち、大学では情報セキュリティを専攻。持続可能な解決策を提案できる点が強みです。',
  },
  { id: 'r10', type: 'h1', content: '本人希望記入欄' },
  { id: 'r11', type: 'paragraph', content: '通勤時間は1時間以内を希望します。' },
];

// --- Shokumu Keirekisho ---
export const SAMPLE_SHOKUMU_CONTENT: RichTextBlock[] = [
  { id: 's1', type: 'h1', content: '職務要約' },
  {
    id: 's2',
    type: 'paragraph',
    content:
      '大学卒業後、広告代理店および人材紹介会社において提案営業に従事。新規開拓から既存顧客に対する深耕営業まで幅広く経験。',
  },
  { id: 's3', type: 'h1', content: '職務経歴' },
  { id: 's4', type: 'h2', content: '綜合印刷株式会社', rightContent: '2018-04 -- 2021-03' },
  { id: 's5', type: 'h3', content: 'SF事業部 販促ツール開発' },
  { id: 's6', type: 'bullet', content: '事業内容：総合印刷・総合広告代理店業' },
  { id: 's7', type: 'bullet', content: '新規開拓営業（テレアポ、HP問い合わせ対応）を担当。' },
];

export const SAMPLE_SHOKUMU_SUPPLEMENTARY: RichTextBlock[] = [
  { id: 'sk1', type: 'h1', content: 'PCスキル' },
  { id: 'sk2', type: 'bullet', content: 'Excel: 入力・集計、表・グラフ、関数计算' },
  { id: 'sk3', type: 'bullet', content: 'PowerPoint: 文字入力、図版作成、アニメーション' },
];
