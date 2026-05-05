import { PersonalInfo } from './resume';
import { RichTextBlock } from './richText';

export interface EditorState {
  version: 2;
  personal: PersonalInfo;
  contentBlocks: RichTextBlock[];
  supplementaryBlocks: RichTextBlock[];
  templateSlug: string;
}
