export interface TemplateSettings {
  colorScheme: string;
  fontSize: '10pt' | '11pt' | '12pt';
  paperSize: 'a4paper' | 'letterpaper';
  sectionColorHighlight: boolean;
  headerAlignment: 'C' | 'L' | 'R';
  customColor?: string;
  className?: string;
}

export interface TemplateDefinition {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  previewImage: string;
  settings: TemplateSettings;
  basePath: string;
  typstFiles: string[];
  extraAssets?: string[];
  schemaFile?: string;
}
