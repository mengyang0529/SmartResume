import type { RichTextBlock } from './richText';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  furiganaFirstName?: string;
  furiganaLastName?: string;
  position: string;
  birth?: string;
  address?: string;
  mobile?: string;
  email: string;
  homepage?: string;
  linkedin?: string;
  gitlab?: string;
  github?: string;
  twitter?: string;
  photo?: {
    url: string;
    shape?: 'circle' | 'rectangle';
    edge?: boolean;
    position?: 'left' | 'right';
  };
  quote?: string;
}

/** @deprecated 仅用于 Markdown/JSON 导入导出 adapter 和旧数据迁移。
 *  编辑器内部使用 EditorState */
export interface Education {
  id: string;
  school: string;
  degree: string;
  rightContent?: string; // Replacing specific fields for the right-side editor slot
  startDate: string;
  endDate?: string;
  description?: string;
  gpa?: string;
  blocks?: RichTextBlock[];
}

/** @deprecated 仅用于 Markdown/JSON 导入导出 adapter 和旧数据迁移。
 *  编辑器内部使用 EditorState */
export interface Entry {
  id: string;
  title: string;
  subtitle: string;
  location?: string;
  rightContent?: string; // Universal slot for dates, locations, or any metadata
  startDate: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
  // --- 職務経歴书 fields (all optional) ---
  projectName?: string; // プロジェクト名
  teamSize?: string; // チーム規模
  technologies?: string; // 使用技術（comma-separated）
}

/** @deprecated 仅用于 Markdown/JSON 导入导出 adapter 和旧数据迁移。
 *  编辑器内部使用 EditorState */
export interface ResumeSection {
  id: string;
  title: string;
  rightContent?: string;
  entries: Entry[];
  blocks?: RichTextBlock[];
}

/** @deprecated 仅用于 Markdown/JSON 导入导出 adapter 和旧数据迁移。
 *  编辑器内部使用 EditorState */
export interface Skill {
  id: string;
  category: string;
  name: string;
}

/** @deprecated 仅用于 Markdown/JSON 导入导出 adapter 和旧数据迁移。
 *  编辑器内部使用 EditorState */
export interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  sections: ResumeSection[];
  skills: Skill[];
  supplementaryBlocks?: RichTextBlock[];
  summary?: string;
}
