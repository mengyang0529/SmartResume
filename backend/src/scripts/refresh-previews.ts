import axios from 'axios';
import { ResumeService } from '../services/resume.service';
import { TypstService } from '../services/typst.service';
import { config } from '../config/env';

/**
 * Script to force refresh all gallery preview PDFs
 * Usage: npx ts-node src/scripts/refresh-previews.ts
 */
async function refreshPreviews() {
  const resumeService = new ResumeService();
  const typstService = new TypstService();

  const templates = [
    'classic-professional',
    'modern-tech',
    'academic-cv',
    'creative-portfolio',
    'executive-level',
    'cover-letter'
  ];

  console.log('🚀 Starting forced refresh of all template previews...');

  try {
    // 1. Clear existing cache in Typst service
    console.log('🧹 Clearing Typst service cache...');
    await axios.post(`${config.typstServiceUrl}/cache/clear`);
    console.log('✅ Cache cleared.');

    // 2. Get sample data
    const sampleData = await resumeService.getSampleResume();

    // 3. Generate and compile for each template
    for (const templateName of templates) {
      console.log(`\n📄 Processing: ${templateName}...`);
      
      const sampleCacheKey = `sample-${templateName}`;
      
      const settings = {
        fontSize: '11pt' as const,
        paperSize: 'a4paper' as const,
        colorScheme: templateName === 'academic-cv' ? 'black' : 
                    templateName === 'modern-tech' ? 'awesome-skyblue' :
                    templateName === 'creative-portfolio' ? 'awesome-emerald' :
                    templateName === 'executive-level' ? 'awesome-concrete' : 'awesome-red',
        headerAlignment: 'C' as const,
        sectionColorHighlight: templateName !== 'academic-cv',
        className: templateName
      };

      const typst = typstService.generateResumeTypst(sampleData as any, settings);

      try {
        const response = await axios.post(`${config.typstServiceUrl}/compile`, {
          typst,
          cacheKey: sampleCacheKey
        }, { timeout: 60000 });

        if (response.data.status === 'success') {
          console.log(`✅ Successfully generated: ${sampleCacheKey}.pdf`);
        } else {
          console.error(`❌ Failed to generate ${templateName}:`, response.data.error);
        }
      } catch (err: any) {
        console.error(`❌ Error compiling ${templateName}:`, err.message);
      }
    }

    console.log('\n✨ All previews have been refreshed successfully!');
  } catch (error: any) {
    console.error('💥 Critical error during refresh:', error.message);
    process.exit(1);
  }
}

// Run the script
refreshPreviews();
