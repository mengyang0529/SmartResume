import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResumeEditor } from './useResumeEditor';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock dependencies
vi.mock('./useResumeCompile', () => ({
  useResumeCompile: () => ({
    pdfUrl: null,
    compileError: null,
    isCompiling: false,
    handleRefreshPreview: vi.fn(),
    handleDownloadPdf: vi.fn(),
  }),
}));

vi.mock('./useResumePersistence', () => ({
  useResumePersistence: () => ({
    openImportFile: vi.fn(),
    fileInputRef: { current: null },
  }),
}));

vi.mock('@utils/storage', () => ({
  storage: {
    saveState: vi.fn(),
    getState: vi.fn(),
    savePhoto: vi.fn(),
    getPhoto: vi.fn(),
    removePhoto: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/editor/modern']}>
    <Routes>
      <Route path="/editor/:templateId" element={children} />
    </Routes>
  </MemoryRouter>
);

describe('useResumeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with templateId from params', () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    expect(result.current.state.templateSlug).toBe('modern');
    expect(result.current.personal.firstName).toBe('');
  });

  it('should update personal info', () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    act(() => {
      result.current.setPersonal({
        ...result.current.personal,
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(result.current.personal.firstName).toBe('John');
    expect(result.current.personal.lastName).toBe('Doe');
  });

  it('should add a section', () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    act(() => {
      result.current.addSection();
    });

    expect(result.current.contentBlocks.length).toBe(1);
    expect(result.current.contentBlocks[0].type).toBe('h1');
    expect(result.current.contentBlocks[0].content).toBe('New Section');
  });

  it('should handle photo remove', () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    act(() => {
      result.current.setPersonal({
        ...result.current.personal,
        photo: { url: 'data:image/png;base64,xxx', shape: 'circle' },
      });
    });

    expect(result.current.personal.photo).toBeDefined();

    act(() => {
      result.current.handlePhotoRemove();
    });

    expect(result.current.personal.photo).toBeUndefined();
  });
});
