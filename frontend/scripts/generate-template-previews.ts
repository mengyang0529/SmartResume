import { mkdirSync, writeFileSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { RESUME_TEMPLATES } from '../src/data/templates';
import { SAMPLE_RESUME_DATA, RIREKISHO_SAMPLE_DATA, SHOKUMU_SAMPLE_DATA } from '../src/data/sampleResume';
import { generateResumeTypst } from '../src/utils/typstGenerators/index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outputDir = join(root, 'public', 'template-previews');
const workDir = join(root, '.tmp-template-previews');
const templatesBaseDir = join(root, 'public', 'templates');

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status ?? 1}`);
  }
}

// Ensure directories exist
rmSync(workDir, { recursive: true, force: true });
mkdirSync(workDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

// Copy Typst template files to workDir
// For awesome-cv, we copy files to the root of workDir (as expected by the generator)
const awesomeCvDir = join(templatesBaseDir, 'awesome-cv');
readdirSync(awesomeCvDir).forEach(file => {
  cpSync(join(awesomeCvDir, file), join(workDir, file), { recursive: true });
});

// For rirekisho and shokumukeirekisho, they are imported via subfolder paths
cpSync(join(templatesBaseDir, 'rirekisho'), join(workDir, 'rirekisho'), { recursive: true });
cpSync(join(templatesBaseDir, 'shokumukeirekisho'), join(workDir, 'shokumukeirekisho'), { recursive: true });

async function main() {
  try {
    for (const template of RESUME_TEMPLATES) {
      console.log(`\n--- Generating preview for ${template.slug} ---`);
      
      const outputWebp = join(outputDir, `${template.slug}.webp`);
      const typPath = join(workDir, `${template.slug}.typ`);
      const pngPath = join(workDir, `${template.slug}.png`);

      // 1. Determine which sample data to use
      let data = SAMPLE_RESUME_DATA;
      if (template.slug === 'rirekisho') {
        data = RIREKISHO_SAMPLE_DATA;
      } else if (template.slug === 'shokumukeirekisho') {
        data = SHOKUMU_SAMPLE_DATA;
      }

      // 2. Generate Typst source using the shared frontend generator
      const typstSource = generateResumeTypst(data, template.settings);

      // 3. Write Typst file
      writeFileSync(typPath, typstSource, 'utf8');

      // 4. Compile Typst to PNG
      console.log(`  Compiling Typst...`);
      run('typst', ['compile', typPath, pngPath, '--root', root]);

      // 5. Convert PNG to WebP and resize using ImageMagick
      console.log(`  Converting to WebP...`);
      run('magick', [
        pngPath, 
        '-resize', '900x1125^', 
        '-gravity', 'north', 
        '-extent', '900x1125', 
        '-quality', '88', 
        outputWebp
      ]);
      
      console.log(`  -> ${outputWebp}`);
    }

    console.log('\nAll template previews generated successfully!');
  } catch (error) {
    console.error('Error generating previews:', error);
    process.exit(1);
  }
}

main();
