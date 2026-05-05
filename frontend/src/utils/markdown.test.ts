import { describe, it, expect } from 'vitest';
import { generateMarkdownResume } from './markdownGenerator';
import { parseMarkdownResume } from './markdownParser';
import { RichTextBlock } from '@app-types/richText';
import { PersonalInfo } from '@app-types/resume';

describe('Markdown roundtrip', () => {
  it('should preserve data after generate and parse', () => {
    const personal: PersonalInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      mobile: '123456789',
      position: 'Software Engineer',
      address: 'Tokyo, Japan',
      birth: '1990-01-01',
      homepage: 'https://example.com',
      linkedin: 'johndoe',
      twitter: 'johndoe',
      quote: 'Hello World',
      photo: { url: 'https://example.com/photo.jpg', shape: 'circle' },
    };

    const contentBlocks: RichTextBlock[] = [
      { id: '1', type: 'h1', content: 'Experience', rightContent: 'Tokyo' },
      { id: '2', type: 'h2', content: 'Company A', rightContent: 'Engineer' },
      { id: '3', type: 'h3', content: 'Senior Dev', rightContent: '2020 - Present' },
      { id: '4', type: 'bullet', content: 'Developing cool stuff', bold: false },
      { id: '5', type: 'paragraph', content: 'Strongly recommend', bold: true },
    ];

    const supplementaryBlocks: RichTextBlock[] = [
      { id: '6', type: 'h2', content: 'Languages' },
      { id: '7', type: 'bullet', content: 'TypeScript', bold: true },
      { id: '8', type: 'bullet', content: 'Go', bold: false },
    ];

    const data = { personal, contentBlocks, supplementaryBlocks };
    const md = generateMarkdownResume(data);
    const parsed = parseMarkdownResume(md);

    // Compare personal info (note: photo shape is default 'circle' in parser)
    expect(parsed.personal.firstName).toBe(personal.firstName);
    expect(parsed.personal.lastName).toBe(personal.lastName);
    expect(parsed.personal.email).toBe(personal.email);
    expect(parsed.personal.mobile).toBe(personal.mobile);
    expect(parsed.personal.photo?.url).toBe(personal.photo?.url);

    // Compare blocks (ignore IDs)
    expect(parsed.contentBlocks.length).toBe(contentBlocks.length);
    parsed.contentBlocks.forEach((b, i) => {
      expect(b.type).toBe(contentBlocks[i].type);
      expect(b.content).toBe(contentBlocks[i].content);
      expect(b.rightContent || '').toBe(contentBlocks[i].rightContent || '');
      expect(!!b.bold).toBe(!!contentBlocks[i].bold);
    });

    expect(parsed.supplementaryBlocks.length).toBe(supplementaryBlocks.length);
    parsed.supplementaryBlocks.forEach((b, i) => {
      expect(b.type).toBe(supplementaryBlocks[i].type);
      expect(b.content).toBe(supplementaryBlocks[i].content);
      expect(!!b.bold).toBe(!!supplementaryBlocks[i].bold);
    });
  });
});
