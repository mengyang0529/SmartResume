import fs from 'fs';
import path from 'path';

const files = [
  'frontend/src/utils/markdownParser.ts',
  'frontend/src/utils/migration.ts',
  'frontend/src/utils/markdown.test.ts',
  'frontend/src/utils/storage.ts',
  'frontend/src/utils/migration.test.ts',
  'frontend/src/utils/typstGenerators/helpers.ts',
  'frontend/src/utils/typstGenerators/shokumukeirekisho.ts',
  'frontend/src/utils/typstGenerators/rirekisho.ts',
  'frontend/src/utils/typstGenerators/shared.ts',
  'frontend/src/utils/typstGenerators/index.ts',
  'frontend/src/utils/typstGenerators/awesomeCv.ts',
  'frontend/src/utils/typstGenerators/generators.test.ts',
  'frontend/src/utils/markdownGenerator.ts',
  'frontend/src/components/RichTextEditor/EditableBlock.tsx',
  'frontend/src/components/RichTextEditor/RichTextToolbar.tsx',
  'frontend/src/components/RichTextEditor/BlockSideMenu.tsx',
  'frontend/src/components/RichTextEditor/RichTextEditor.tsx',
  'frontend/src/components/ResumePersonalInfoSection.tsx',
  'frontend/src/hooks/useResumePersistence.ts',
  'frontend/src/hooks/useResumeCompile.ts',
  'frontend/src/hooks/useResumeEditor.tsx',
  'frontend/src/data/templates.ts',
  'frontend/src/data/sampleBlocks.ts',
  'frontend/src/data/sampleResume.ts',
  'frontend/src/pages/TemplatesPage.tsx',
  'frontend/src/pages/ResumeEditorPage.tsx',
  'frontend/src/pages/ImportPage.tsx',
  'frontend/src/pages/HomePage.tsx',
  'frontend/src/compiler/compiler.worker.ts'
];

const mappings = [
  { from: '../../types/', to: '@types/' },
  { from: '../types/', to: '@types/' },
  { from: '../../utils/', to: '@utils/' },
  { from: '../utils/', to: '@utils/' },
  { from: '../../hooks/', to: '@hooks/' },
  { from: '../hooks/', to: '@hooks/' },
  { from: '../../components/', to: '@components/' },
  { from: '../components/', to: '@components/' },
  { from: '../../services/', to: '@services/' },
  { from: '../services/', to: '@services/' },
  { from: '../../data/', to: '@data/' },
  { from: '../data/', to: '@data/' },
  { from: '../../constants/', to: '@constants/' },
  { from: '../constants/', to: '@constants/' },
];

files.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  mappings.forEach(mapping => {
    // Escape dots for regex
    const escapedFrom = mapping.from.replace(/\./g, '\\.');
    const regex = new RegExp(escapedFrom, 'g');
    content = content.replace(regex, mapping.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
