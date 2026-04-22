import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper to extract content between curly braces
function extractBraces(text: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth > 0) current += '{';
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0) {
        results.push(current);
        current = '';
      } else {
        current += '}';
      }
    } else if (depth > 0) {
      current += text[i];
    }
  }
  return results;
}

function cleanLatex(text: string): string {
  return text
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\item\s*/g, '')
    .trim();
}

async function main() {
  const rootDir = path.resolve(__dirname, '../../..');
  
  // 1. Parse resume.tex (Personal Info)
  const resumeTex = fs.readFileSync(path.join(rootDir, 'resume.tex'), 'utf-8');
  const firstName = resumeTex.match(/\\name\{([^}]*)\}/)?.[1] || '';
  const lastName = resumeTex.match(/\\name\{[^}]*\}\{([^}]*)\}/)?.[1] || '';
  const position = resumeTex.match(/\\position\{([^}]*)\}/)?.[1] || '';
  const address = resumeTex.match(/\\address\{([^}]*)\}/)?.[1] || '';
  const mobile = resumeTex.match(/\\mobile\{([^}]*)\}/)?.[1] || '';
  const email = resumeTex.match(/\\email\{([^}]*)\}/)?.[1] || '';
  const github = resumeTex.match(/\\github\{([^}]*)\}/)?.[1] || '';

  const personal = {
    firstName,
    lastName,
    position,
    address,
    mobile,
    email,
    github: `https://github.com/${github}`,
  };

  // 2. Parse education.tex
  const educationTex = fs.readFileSync(path.join(rootDir, 'education.tex'), 'utf-8');
  const education: any[] = [];
  const eduMatches = educationTex.matchAll(/\\cventry\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/gs);
  for (const match of eduMatches) {
    education.push({
      id: Math.random().toString(36).substr(2, 9),
      school: cleanLatex(match[1]),
      degree: cleanLatex(match[2]),
      field: '', // modern-cv doesn't distinguish field easily
      location: cleanLatex(match[3]),
      startDate: match[4].split(' - ')[0].trim(),
      endDate: match[4].split(' - ')[1]?.trim() || '',
      description: cleanLatex(match[5]),
    });
  }

  // 3. Parse experience.tex (Work Experience)
  const experienceTex = fs.readFileSync(path.join(rootDir, 'experience.tex'), 'utf-8');
  const experience: any[] = [];
  const expMatches = experienceTex.matchAll(/\\cventry\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([\s\S]*?)\}/g);
  for (const match of expMatches) {
    const highlights = match[5].match(/\\item\s*\{([\s\S]*?)\}/g)?.map(item => cleanLatex(item)) || [];
    experience.push({
      id: Math.random().toString(36).substr(2, 9),
      company: cleanLatex(match[1]),
      position: cleanLatex(match[2]),
      location: cleanLatex(match[3]),
      startDate: match[4].split(' - ')[0].trim(),
      endDate: match[4].split(' - ')[1]?.trim() || '',
      highlights,
    });
  }

  // 4. Parse skills.tex
  const skillsTex = fs.readFileSync(path.join(rootDir, 'skills.tex'), 'utf-8');
  const skills: any[] = [];
  const skillMatches = skillsTex.matchAll(/\\cvskill\s*\{([^}]*)\}\s*\{([^}]*)\}/g);
  for (const match of skillMatches) {
    skills.push({
      id: Math.random().toString(36).substr(2, 9),
      category: cleanLatex(match[1]),
      name: cleanLatex(match[2]),
    });
  }

  // 5. Parse projects.tex
  const projectsTex = fs.readFileSync(path.join(rootDir, 'projects.tex'), 'utf-8');
  const projects: any[] = [];
  const projectMatches = projectsTex.matchAll(/\\cventry\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([\s\S]*?)\}/g);
  for (const match of projectMatches) {
    const description = match[5].match(/\\item\s*\{([\s\S]*?)\}/g)?.map(item => cleanLatex(item)).join('\n') || '';
    projects.push({
      id: Math.random().toString(36).substr(2, 9),
      name: cleanLatex(match[1]),
      description,
      technologies: [], // Needs manual parsing or extra logic
    });
  }

  const resumeData = {
    personal,
    education,
    experience,
    skills,
    projects,
  };

  // 6. Save to Database
  console.log('Creating user...');
  const user = await prisma.user.upsert({
    where: { email: personal.email },
    update: {},
    create: {
      email: personal.email,
      name: `${personal.firstName} ${personal.lastName}`,
    },
  });

  console.log('Creating resume...');
  const resume = await prisma.resume.create({
    data: {
      title: 'Imported from LaTeX',
      content: resumeData as any,
      settings: {
        colorScheme: 'awesome-red',
        fontSize: '11pt',
        paperSize: 'a4paper',
        sectionColorHighlight: false,
        headerAlignment: 'C',
      },
      userId: user.id,
    },
  });

  console.log(`Success! Resume created with ID: ${resume.id}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
