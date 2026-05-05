import type { TemplateDefinition } from '@app-types/template';

export const RESUME_TEMPLATES: TemplateDefinition[] = [
  {
    id: 1,
    slug: 'classic',
    name: 'Classic',
    category: 'Awesome-CV',
    description: 'Minimal black-and-white elegant style.',
    previewImage: '/template-previews/classic.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
    },
    basePath: '/templates/awesome-cv/',
    typstFiles: ['awesome-cv-classic.typ'],
    extraAssets: ['lang.toml'],
    schemaFile: 'awesome-cv-classic.md',
  },
  {
    id: 2,
    slug: 'modern',
    name: 'Modern',
    category: 'Awesome-CV',
    description: 'Original Awesome CV style with colored accents.',
    previewImage: '/template-previews/modern.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
    },
    basePath: '/templates/awesome-cv/',
    typstFiles: ['awesome-cv-modern.typ'],
    extraAssets: ['lang.toml'],
    schemaFile: 'awesome-cv-modern.md',
  },
  {
    id: 3,
    slug: 'art',
    name: 'Art',
    category: 'Awesome-CV',
    description: 'Dark-themed artistic style with vibrant accents.',
    previewImage: '/template-previews/art.webp',
    settings: {
      colorScheme: '#FF6138',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
    },
    basePath: '/templates/awesome-cv/',
    typstFiles: ['awesome-cv-art.typ'],
    extraAssets: ['lang.toml'],
    schemaFile: 'awesome-cv-art.md',
  },
  {
    id: 4,
    slug: 'rirekisho',
    name: 'Rirekisho',
    category: 'Japanese',
    description: 'Traditional Japanese-style resume (履歴書) with standard JIS format.',
    previewImage: '/template-previews/rirekisho.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '10pt',
      paperSize: 'a4paper',
      sectionColorHighlight: false,
      headerAlignment: 'L',
    },
    basePath: '/templates/rirekisho/',
    typstFiles: ['rirekisho.typ'],
    schemaFile: 'rirekisho.md',
  },
  {
    id: 5,
    slug: 'shokumukeirekisho',
    name: 'Shokumu Keirekisho',
    category: 'Japanese',
    description: 'Japanese career history document (職務経歴書).',
    previewImage: '/template-previews/shokumukeirekisho.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '10pt',
      paperSize: 'a4paper',
      sectionColorHighlight: false,
      headerAlignment: 'L',
    },
    basePath: '/templates/shokumukeirekisho/',
    typstFiles: ['shokumukeirekisho.typ'],
    schemaFile: 'shokumukeirekisho.md',
  },
];

export const DEFAULT_TEMPLATE = RESUME_TEMPLATES[0];

export function findTemplateBySlug(slug?: string) {
  if (!slug) return DEFAULT_TEMPLATE;
  return RESUME_TEMPLATES.find(template => template.slug === slug || String(template.id) === slug);
}
