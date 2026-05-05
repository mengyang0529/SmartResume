import { describe, it, expect } from 'vitest';
import { migrateResumeDataToEditorState } from './migration';
import { SAMPLE_RESUME_DATA, SHOKUMU_SAMPLE_DATA } from '@data/sampleResume';

describe('migrateResumeDataToEditorState', () => {
  it('should migrate SAMPLE_RESUME_DATA correctly', () => {
    const editorState = migrateResumeDataToEditorState(SAMPLE_RESUME_DATA, 'classic');

    expect(editorState.version).toBe(2);
    expect(editorState.templateSlug).toBe('classic');
    expect(editorState.personal.firstName).toBe(SAMPLE_RESUME_DATA.personal.firstName);

    // Education should be migrated to contentBlocks
    const eduTitle = editorState.contentBlocks.find(
      b => b.type === 'h1' && b.content === 'Education'
    );
    expect(eduTitle).toBeDefined();

    // Check education entry
    const eduSchool = editorState.contentBlocks.find(
      b => b.type === 'h2' && b.content === 'Institute of Theoretical Chronodynamics'
    );
    expect(eduSchool).toBeDefined();
    expect(eduSchool?.rightContent).toBe(''); // SAMPLE_RESUME_DATA education has no rightContent

    // Professional Experience section
    const expTitle = editorState.contentBlocks.find(
      b => b.type === 'h1' && b.content === 'Professional Experience'
    );
    expect(expTitle).toBeDefined();

    // Skills
    const skillsTitle = editorState.supplementaryBlocks.find(
      b => b.type === 'h1' && b.content === 'Skills'
    );
    expect(skillsTitle).toBeDefined();
    const langCat = editorState.supplementaryBlocks.find(
      b => b.type === 'h2' && b.content === 'Languages'
    );
    expect(langCat).toBeDefined();
  });

  it('should migrate summary to contentBlocks', () => {
    const editorState = migrateResumeDataToEditorState(SHOKUMU_SAMPLE_DATA, 'shokumukeirekisho');

    // Summary is the first h1/p in contentBlocks
    expect(editorState.contentBlocks[0].type).toBe('h1');
    expect(editorState.contentBlocks[0].content).toBe('Professional Summary');
    expect(editorState.contentBlocks[1].type).toBe('paragraph');
    expect(editorState.contentBlocks[1].content).toBe(SHOKUMU_SAMPLE_DATA.summary);
  });
});
