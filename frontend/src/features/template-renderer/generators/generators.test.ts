import { describe, it, expect } from 'vitest';
import { generateResumeTypst } from './index';
import { SAMPLE_RESUME_DATA, RIREKISHO_SAMPLE_DATA, SHOKUMU_SAMPLE_DATA } from '@data/sampleResume';
import type { TemplateSettings } from '@app-types/template';
import { migrateResumeDataToEditorState } from '@features/editor/services/migration';

describe('typstGenerators', () => {
  const defaultSettings: TemplateSettings = {
    colorScheme: 'awesome-red',
    fontSize: '11pt',
    paperSize: 'a4paper',
    sectionColorHighlight: true,
    headerAlignment: 'C',
  };

  const getSource = (data: any, settings: TemplateSettings, slug: string) => {
    const state = migrateResumeDataToEditorState(data, slug);
    return generateResumeTypst(
      state.personal,
      state.contentBlocks,
      state.supplementaryBlocks,
      settings,
      slug
    );
  };

  it('should generate Typst for Classic template', () => {
    const slug = 'classic';
    const settings: TemplateSettings = { ...defaultSettings };
    const output = getSource(SAMPLE_RESUME_DATA, settings, slug);

    expect(output).toContain('#import "awesome-cv-classic.typ": *');
    expect(output).toContain('firstname: "Smart"');
    expect(output).toContain('lastname: "Resume"');
  });

  it('should generate Typst for Modern template', () => {
    const slug = 'modern';
    const settings: TemplateSettings = { ...defaultSettings };
    const output = getSource(SAMPLE_RESUME_DATA, settings, slug);

    expect(output).toContain('#import "awesome-cv-modern.typ": *');
  });

  it('should generate Typst for Art template', () => {
    const slug = 'art';
    const settings: TemplateSettings = { ...defaultSettings, colorScheme: '#FF6138' };
    const output = getSource(SAMPLE_RESUME_DATA, settings, slug);

    expect(output).toContain('#import "awesome-cv-art.typ": *');
    expect(output).toContain('accent-color: "#FF6138"');
  });

  it('should generate Typst for Rirekisho template', () => {
    const slug = 'rirekisho';
    const settings: TemplateSettings = { ...defaultSettings, fontSize: '10pt' };
    const output = getSource(RIREKISHO_SAMPLE_DATA, settings, slug);

    expect(output).toContain('#import "rirekisho.typ": *');
    expect(output).toContain('山田 太郎');
    expect(output).toContain('学歴・職歴');
  });

  it('should generate Typst for Shokumu Keirekisho template', () => {
    const slug = 'shokumukeirekisho';
    const settings: TemplateSettings = { ...defaultSettings, fontSize: '10pt' };
    const output = getSource(SHOKUMU_SAMPLE_DATA, settings, slug);

    expect(output).toContain('#import "shokumukeirekisho.typ": *');
    expect(output).toContain('職務要約');
    expect(output).toContain('職務経歴');
    expect(output).toContain('SF事業部 販促ツール開発');
  });

  it('should fall back to Classic if template is unknown', () => {
    const slug = 'invalid';
    const settings: TemplateSettings = { ...defaultSettings };
    const output = getSource(SAMPLE_RESUME_DATA, settings, slug);

    expect(output).toContain('#import "awesome-cv-classic.typ": *');
  });
});
